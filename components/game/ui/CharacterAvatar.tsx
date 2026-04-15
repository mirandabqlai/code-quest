// components/game/ui/CharacterAvatar.tsx
//
// Reusable pixel-art avatar showing a character's 3-letter initials
// inside a colored border box. Used in chat bubbles, room panels,
// story tabs, and challenge cards.

'use client';

interface CharacterAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { box: '28px', font: '7px' },
  md: { box: '36px', font: '8px' },
  lg: { box: '40px', font: '8px' },
} as const;

export default function CharacterAvatar({ name, color, size = 'md' }: CharacterAvatarProps) {
  const { box, font } = sizeMap[size];

  return (
    <div
      style={{
        width: box,
        height: box,
        border: `2px solid ${color}`,
        borderRadius: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: font,
        color,
        background: 'var(--bg-dark)',
        flexShrink: 0,
      }}
    >
      {name.slice(0, 3).toUpperCase()}
    </div>
  );
}
