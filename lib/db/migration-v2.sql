-- migration-v2.sql
--
-- Adds v2 columns to the games table for room-based content.
-- Run this against the production Neon Postgres database before deploying v2.
--
-- What these columns store:
--   office_layout — the room grid, connections, and positions (OfficeLayout type)
--   mike_content  — Mike's guided tour dialogue and traced action (MikeTour type)
--   room_content  — per-room teaching content keyed by room ID (Record<string, CharacterContent>)
--   version       — 1 for original flat layout games, 2 for room-based v2 games

ALTER TABLE games ADD COLUMN IF NOT EXISTS office_layout JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS mike_content JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS room_content JSONB;
ALTER TABLE games ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
