'use client';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'border-[var(--border-bright)] text-[var(--text-primary)] hover:border-[var(--neon-green)] hover:text-[var(--neon-green)]',
  success: 'border-[var(--neon-green)] text-[var(--neon-green)]',
  danger: 'border-[var(--neon-coral)] text-[var(--neon-coral)]',
};

const sizeStyles = {
  sm: 'text-[7px] px-2.5 py-1.5',
  md: 'text-[9px] px-5 py-2.5',
};

export default function PixelButton({ children, onClick, disabled, variant = 'default', size = 'md' }: PixelButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        font-[var(--font-pixel)] uppercase tracking-[2px]
        bg-[var(--bg-panel)] border-[3px] cursor-pointer
        transition-all duration-100
        hover:bg-[var(--border-pixel)] hover:-translate-x-0.5 hover:-translate-y-0.5
        hover:shadow-[2px_2px_0_var(--neon-green)]
        active:translate-x-0 active:translate-y-0 active:shadow-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]} ${sizeStyles[size]}
      `}
      style={{ fontFamily: 'var(--font-pixel)', imageRendering: 'pixelated' }}
    >
      {children}
    </button>
  );
}
