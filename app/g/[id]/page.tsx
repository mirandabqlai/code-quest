import { notFound } from 'next/navigation';
import { getGame, incrementViewCount } from '@/lib/db/queries';
import type { GameContent } from '@/lib/game/types';
import GameShell from '@/components/game/GameShell';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) notFound();

  // Increment view count (fire and forget)
  incrementViewCount(id).catch(() => {});

  // Assemble whatever content is available
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
