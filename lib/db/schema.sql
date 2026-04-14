CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  repo_url TEXT NOT NULL UNIQUE,
  repo_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  analysis JSONB,
  tour_content JSONB,
  modes_content JSONB,
  advanced_content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_games_repo_url ON games(repo_url);
