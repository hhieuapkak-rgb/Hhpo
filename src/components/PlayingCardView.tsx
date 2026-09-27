import React from 'react';
import { PlayingCard } from '../utils/cardGames';

interface PlayingCardViewProps {
  card: PlayingCard;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  interactiveHint?: string;
}

export const PlayingCardView: React.FC<PlayingCardViewProps> = ({
  card,
  onClick,
  size = 'md',
  interactiveHint,
}) => {
  const isRed = card.suit === '♦' || card.suit === '♥';

  const dimensions = {
    sm: 'w-14 h-20 text-sm',
    md: 'w-20 h-28 text-base',
    lg: 'w-24 h-36 text-lg',
  }[size];

  const centerSuitSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  if (!card.faceUp) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        title={interactiveHint || 'Bấm để nặn bài'}
        className={`${dimensions} relative rounded-lg border-2 border-amber-300/70 bg-[#7F1D1D] shadow-md transition-transform duration-150 ${
          onClick
            ? 'cursor-pointer hover:-translate-y-1.5 hover:border-amber-200 active:scale-95'
            : 'cursor-default'
        } flex flex-col items-center justify-center overflow-hidden select-none`}
      >
        <div className="absolute inset-1.5 rounded border border-amber-400/40 bg-[#991B1B] flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full border border-amber-300/50 flex items-center justify-center text-amber-300 font-display text-xs">
            VN
          </div>
          {onClick && (
            <span className="mt-1 text-[10px] font-medium text-amber-200/90 whitespace-nowrap">
              Lật bài
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${dimensions} relative rounded-lg border border-slate-300 bg-white shadow-md flex flex-col justify-between p-1.5 select-none transition-transform duration-150 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${isRed ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}
    >
      <div className="flex items-center justify-between leading-none">
        <span className="font-mono font-semibold tracking-tighter">{card.rankLabel}</span>
        <span className="text-xs">{card.suit}</span>
      </div>

      <div className={`${centerSuitSize} self-center leading-none`}>
        {card.suit}
      </div>

      <div className="flex items-center justify-between leading-none rotate-180">
        <span className="font-mono font-semibold tracking-tighter">{card.rankLabel}</span>
        <span className="text-xs">{card.suit}</span>
      </div>
    </div>
  );
};
