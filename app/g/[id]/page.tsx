import { notFound } from 'next/navigation';
import { getGame, incrementViewCount } from '@/lib/db/queries';
import type { GameContent } from '@/lib/game/types';
import type { GameContentV2 } from '@/lib/game/types-v2';
import GameShell from '@/components/game/GameShell';
import GameShellV2 from '@/components/game/GameShellV2';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) notFound();

  // Increment view count (fire and forget)
  incrementViewCount(id).catch(() => {});

  // Check if this game has v2 content by looking for the office_layout column.
  // The DB row is typed as GameRow (v1), but v2 rows have extra JSONB columns
  // that TypeScript doesn't know about. We cast through `unknown` to access them.
  const row = game as unknown as Record<string, unknown>;
  const hasV2Content = row.office_layout != null;

  if (hasV2Content) {
    // === V2 path: room-based layout with Mike's tour ===
    // v2 characters include roomId; the analysis column holds them if generated with v2 prompt.
    const analysis = row.analysis as { meta?: GameContentV2['meta']; characters?: GameContentV2['characters'] } | null;

    const contentV2: GameContentV2 = {
      meta: analysis?.meta ?? {
        repoName: game.repo_name ?? '',
        repoDescription: '',
        techStack: [],
        generatedAt: '',
      },
      characters: analysis?.characters ?? [],
      office: row.office_layout as GameContentV2['office'],
      mike: (row.mike_content as GameContentV2['mike']) ?? {
        welcomeDialogue: [],
        roomIntros: [],
        tracedAction: { title: '', steps: [], groupChat: [], dataFlow: [] },
      },
      roomContent: (row.room_content as GameContentV2['roomContent']) ?? {},
    };

    return <GameShellV2 content={contentV2} />;
  }

  // === V1 path: original flat layout (backwards compat for cached games) ===
  const content: Partial<GameContent> = {};

  if (game.analysis) {
    content.characters = game.analysis.characters;
    content.folderTree = game.analysis.folderTree;
    content.dataFlows = game.analysis.dataFlows;
  }

  if (game.tour_content) {
    content.meta = game.tour_content.meta;
    content.officeTour = game.tour_content.officeTour;
  }

  if (game.modes_content) {
    content.mailRoom = game.modes_content.mailRoom;
    content.bugHunt = game.modes_content.bugHunt;
  }

  if (game.advanced_content) {
    content.buildOffice = game.advanced_content.buildOffice;
    content.bossBattle = game.advanced_content.bossBattle;
  }

  return <GameShell content={content} />;
}
