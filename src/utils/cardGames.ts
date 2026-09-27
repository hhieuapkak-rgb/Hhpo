// Authentic Vietnamese Card Games Logic: 3 Cây (Cào Rùa 36 lá) & Liêng (Cào Tố 52 lá)

export type Suit = '♦' | '♥' | '♣' | '♠';

export interface PlayingCard {
  rank: number; // 1 (A) to 13 (K)
  rankLabel: string;
  suit: Suit;
  suitWeight: number; // In Vietnamese 3 Cây & Liêng: ♦ (4) > ♥ (3) > ♣ (2) > ♠ (1)
  faceUp: boolean;
}

const SUIT_WEIGHTS: Record<Suit, number> = {
  '♦': 4, // Rô mạnh nhất
  '♥': 3, // Cơ
  '♣': 2, // Tép / Chuồn
  '♠': 1, // Bích
};

const SUIT_NAMES: Record<Suit, string> = {
  '♦': 'Rô',
  '♥': 'Cơ',
  '♣': 'Tép',
  '♠': 'Bích',
};

export function getRankLabel(rank: number): string {
  if (rank === 1) return 'A';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  return String(rank);
}

export function getCardFullName(card: PlayingCard): string {
  return `${ card.rankLabel } ${ SUIT_NAMES[card.suit] }`;
}

export function shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Bộ bài 3 Cây chuẩn miền Bắc Việt Nam: 36 lá từ A đến 9 (bỏ 10, J, Q, K)
 */
export function create3CayDeck(): PlayingCard[] {
  const suits: Suit[] = ['♦', '♥', '♣', '♠'];
  const deck: PlayingCard[] = [];
  for (const suit of suits) {
    for (let r = 1; r <= 9; r++) {
      deck.push({
        rank: r,
        rankLabel: getRankLabel(r),
        suit,
        suitWeight: SUIT_WEIGHTS[suit],
        faceUp: false,
      });
    }
  }
  return shuffleDeck(deck);
}

/**
 * Bộ bài Liêng chuẩn 52 lá từ A đến K
 */
export function createLiengDeck(): PlayingCard[] {
  const suits: Suit[] = ['♦', '♥', '♣', '♠'];
  const deck: PlayingCard[] = [];
  for (const suit of suits) {
    for (let r = 1; r <= 13; r++) {
      deck.push({
        rank: r,
        rankLabel: getRankLabel(r),
        suit,
        suitWeight: SUIT_WEIGHTS[suit],
        faceUp: false,
      });
    }
  }
  return shuffleDeck(deck);
}

/**
 * Chấm điểm bài 3 Cây (Cào Rùa):
 * - Sáp (3 lá cùng số): mạnh nhất
 * - Điểm từ 1 đến 10 (Tổng % 10 === 0 được tính là 10 điểm!)
 * - Khi bằng điểm: So chất cao nhất trong tay (Rô ♦ > Cơ ♥ > Tép ♣ > Bích ♠)
 * - Nếu cùng chất cao nhất: Trong 3 Cây Việt Nam, Át Rô (A♦) là Củ Rùa lớn nhất, sau đó 9 > 8 > ... > 2
 */
export interface BaCayEval {
  points: number; // 1..10
  isSap: boolean;
  hasCuRua: boolean; // Có A♦
  label: string;
  scoreValue: number; // Dùng để so sánh trực tiếp ai lớn hơn
  bestCard: PlayingCard;
}

function get3CayRankStrength(rank: number): number {
  // Trong 3 cây, A (Át) là lớn nhất khi so cùng chất, sau đó 9 -> 2
  return rank === 1 ? 10 : rank;
}

export function evaluate3CayHand(cards: PlayingCard[]): BaCayEval {
  const sum = cards.reduce((acc, c) => acc + c.rank, 0);
  const mod = sum % 10;
  const points = mod === 0 ? 10 : mod;
  const isSap = cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
  const hasCuRua = cards.some((c) => c.rank === 1 && c.suit === '♦');

  // Tìm lá bài lớn nhất để phá hòa: ưu tiên Chất (♦ > ♥ > ♣ > ♠), sau đó đến độ lớn số (A > 9 > 8 ... > 2)
  const sortedCards = [...cards].sort((a, b) => {
    if (b.suitWeight !== a.suitWeight) return b.suitWeight - a.suitWeight;
    return get3CayRankStrength(b.rank) - get3CayRankStrength(a.rank);
  });
  const bestCard = sortedCards[0];

  const tieBreaker = bestCard.suitWeight * 20 + get3CayRankStrength(bestCard.rank);
  const scoreValue = (isSap ? 10000 : points * 500) + tieBreaker;

  let label = `${points} Nước (${getCardFullName(bestCard)})`;
  if (isSap) {
    label = `SÁP ${cards[0].rankLabel} (${getCardFullName(bestCard)})`;
  } else if (points === 10 && hasCuRua) {
    label = `10 Nước · CỦ RÙA A♦`;
  } else if (points === 10) {
    label = `10 Nước Đại Bàng (${getCardFullName(bestCard)})`;
  }

  return {
    points,
    isSap,
    hasCuRua,
    label,
    scoreValue,
    bestCard,
  };
}

/**
 * Chấm điểm bài Liêng (52 lá):
 * Thứ tự mạnh -> yếu:
 * 1. SÁP (3 lá giống nhau, Sáp A lớn nhất, sau đó K -> 2)
 * 2. LIÊNG (3 lá liên tiếp nhau, ví dụ Q-K-A, J-Q-K, ..., A-2-3)
 * 3. ẢNH / ĐĨ (3 lá đều là hình J, Q, K không liên tiếp)
 * 4. ĐIỂM (0..9 điểm: J, Q, K, 10 tính là 0; A tính 1; tổng % 10)
 * Phá hòa bằng lá bài có chất cao nhất (♦ > ♥ > ♣ > ♠) rồi đến số cao nhất (A > K > Q > J > 10 ... > 2)
 */
export interface LiengEval {
  category: 'SAP' | 'LIENG' | 'ANH' | 'DIEM';
  points: number;
  label: string;
  scoreValue: number;
}

function getLiengRankStrength(rank: number): number {
  return rank === 1 ? 14 : rank; // A = 14, K = 13, ..., 2 = 2
}

export function evaluateLiengHand(cards: PlayingCard[]): LiengEval {
  const ranks = cards.map((c) => c.rank).sort((a, b) => a - b);
  const strengths = cards.map((c) => getLiengRankStrength(c.rank)).sort((a, b) => a - b);

  const isSap = ranks[0] === ranks[1] && ranks[1] === ranks[2];

  // Kiểm tra Liêng: 3 lá liên tiếp (kể cả A-2-3 hoặc Q-K-A)
  const isNormalStraight =
    strengths[0] + 1 === strengths[1] && strengths[1] + 1 === strengths[2];
  const isAceLowStraight = ranks[0] === 1 && ranks[1] === 2 && ranks[2] === 3;
  const isLieng = !isSap && (isNormalStraight || isAceLowStraight);

  // Kiểm tra Ảnh (Đĩ): cả 3 lá đều là J(11), Q(12), K(13) và không phải Sáp hay Liêng
  const isAnh = !isSap && !isLieng && cards.every((c) => c.rank >= 11 && c.rank <= 13);

  // Điểm: A=1, 2..9 giữ nguyên, 10/J/Q/K = 0
  const rawSum = cards.reduce((acc, c) => acc + (c.rank >= 10 ? 0 : c.rank), 0);
  const points = rawSum % 10;

  // Tìm lá mạnh nhất để phá hòa (trong Liêng so Chất trước: Rô ♦ > Cơ ♥ > Tép ♣ > Bích ♠, hoặc số lớn nhất)
  const sortedBySuitThenRank = [...cards].sort((a, b) => {
    if (b.suitWeight !== a.suitWeight) return b.suitWeight - a.suitWeight;
    return getLiengRankStrength(b.rank) - getLiengRankStrength(a.rank);
  });
  const bestCard = sortedBySuitThenRank[0];
  const tieBreaker = bestCard.suitWeight * 25 + getLiengRankStrength(bestCard.rank);

  if (isSap) {
    return {
      category: 'SAP',
      points: 10,
      label: `SÁP ${cards[0].rankLabel}`,
      scoreValue: 40000 + strengths[2] * 100 + tieBreaker,
    };
  }

  if (isLieng) {
    const highestRankInStraight = isAceLowStraight ? 14 : strengths[2];
    const sortedDisplay = [...cards]
      .sort((a, b) => getLiengRankStrength(a.rank) - getLiengRankStrength(b.rank))
      .map((c) => c.rankLabel)
      .join('-');
    return {
      category: 'LIÊNG' as unknown as 'LIENG',
      points: 10,
      label: `LIÊNG ${sortedDisplay} (${getCardFullName(bestCard)})`,
      scoreValue: 30000 + highestRankInStraight * 100 + tieBreaker,
    };
  }

  if (isAnh) {
    return {
      category: 'ANH',
      points: 10,
      label: `BA ẢNH ĐĨ (${getCardFullName(bestCard)})`,
      scoreValue: 20000 + tieBreaker,
    };
  }

  return {
    category: 'DIEM',
    points,
    label: `${points} Điểm (${getCardFullName(bestCard)})`,
    scoreValue: points * 1000 + tieBreaker,
  };
}
