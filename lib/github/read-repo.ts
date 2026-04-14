const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'vendor',
  '__pycache__', '.cache', 'coverage', '.turbo', '.vercel',
  'target', 'out', '.output', 'public', 'assets', 'static',
]);

const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'rb',
  'swift', 'kt', 'vue', 'svelte', 'cs', 'php', 'ex', 'exs',
]);

const CONFIG_FILES = new Set([
  'README.md', 'readme.md', 'package.json', 'Cargo.toml',
  'go.mod', 'pyproject.toml', 'requirements.txt', 'Gemfile',
  'build.gradle', 'pom.xml', 'Makefile', 'docker-compose.yml',
  'Dockerfile',
]);

const MAX_FILES_TO_READ = 50;
const MAX_LINES_PER_FILE = 200;
const MAX_TREE_FILES = 1000;

export interface RepoSnapshot {
  owner: string;
  repo: string;
  description: string;
  fileTree: string[];
  files: { path: string; content: string }[];
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function githubFetch(path: string): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CodeQuest',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers });
}

export async function readRepo(owner: string, repo: string): Promise<RepoSnapshot> {
  // 1. Get repo metadata
  const metaRes = await githubFetch(`/repos/${owner}/${repo}`);
  if (!metaRes.ok) {
    if (metaRes.status === 404) throw new Error('REPO_NOT_FOUND');
    if (metaRes.status === 403) throw new Error('RATE_LIMITED');
    throw new Error(`GitHub API error: ${metaRes.status}`);
  }
  const meta = await metaRes.json();

  // 2. Get file tree (recursive)
  const treeRes = await githubFetch(`/repos/${owner}/${repo}/git/trees/${meta.default_branch}?recursive=1`);
  if (!treeRes.ok) throw new Error(`Failed to read file tree: ${treeRes.status}`);
  const treeData = await treeRes.json();

  // 3. Filter tree — skip ignored dirs, keep code files
  const allPaths: string[] = [];
  const codePaths: string[] = [];

  for (const item of treeData.tree) {
    if (item.type !== 'blob') continue;
    const parts = item.path.split('/');
    if (parts.some((p: string) => SKIP_DIRS.has(p))) continue;
    allPaths.push(item.path);

    const filename = parts[parts.length - 1];
    const ext = filename.split('.').pop() ?? '';

    if (CONFIG_FILES.has(filename) || CODE_EXTENSIONS.has(ext)) {
      codePaths.push(item.path);
    }
  }

  if (allPaths.length > MAX_TREE_FILES) {
    throw new Error('REPO_TOO_LARGE');
  }

  // 4. Prioritize which files to read in full
  const toRead = prioritizeFiles(codePaths).slice(0, MAX_FILES_TO_READ);

  // 5. Fetch file contents in parallel (batches of 10)
  const files: { path: string; content: string }[] = [];
  for (let i = 0; i < toRead.length; i += 10) {
    const batch = toRead.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async (path) => {
        const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.encoding !== 'base64' || !data.content) return null;
        const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
        const truncated = decoded.split('\n').slice(0, MAX_LINES_PER_FILE).join('\n');
        return { path, content: truncated };
      })
    );
    files.push(...results.filter((f): f is { path: string; content: string } => f !== null));
  }

  return {
    owner,
    repo,
    description: meta.description ?? '',
    fileTree: allPaths,
    files,
  };
}

function prioritizeFiles(paths: string[]): string[] {
  const priority: { path: string; score: number }[] = paths.map((path) => {
    let score = 0;
    const filename = path.split('/').pop() ?? '';
    const depth = path.split('/').length;

    // Config files are high priority
    if (CONFIG_FILES.has(filename)) score += 100;
    // README is highest
    if (filename.toLowerCase() === 'readme.md') score += 200;
    // Entry points
    if (/^(index|main|app|server|mod)\.(ts|tsx|js|jsx|py|go|rs)$/.test(filename)) score += 80;
    // Top-level files are more important
    score += Math.max(0, 20 - depth * 5);
    // Route/page files
    if (/page\.(ts|tsx)$/.test(filename) || /route\.(ts|tsx)$/.test(filename)) score += 60;
    // Shorter paths = more important (likely core files)
    score += Math.max(0, 10 - path.length / 20);

    return { path, score };
  });

  return priority.sort((a, b) => b.score - a.score).map((p) => p.path);
}
