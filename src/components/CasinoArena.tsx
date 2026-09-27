import React, { useState } from 'react';
import {
  PlayingCard,
  create3CayDeck,
  createLiengDeck,
  evaluate3CayHand,
  evaluateLiengHand,
  BaCayEval,
  LiengEval,
} from '../utils/cardGames';
import { PlayingCardView } from './PlayingCardView';
import { formatVND, formatCompactVND, sound } from '../utils/sound';
import casinoBannerImg from '../assets/images/casino_chieu_bac_scene_1790508096434.jpg';

interface CasinoArenaProps {
  cash: number;
  energy: number;
  initialGame?: 'BACAY' | 'LIENG' | 'TAIXIU';
  onUpdateCasinoResult: (
    cashDelta: number,
    sanityDelta: number,
    energyDelta: number,
    gameType: 'BACAY' | 'LIENG' | 'TAIXIU',
    logTitle: string,
    logDetail: string
  ) => void;
  onNavigateFinance: () => void;
}

type CasinoGameTab = 'BACAY' | 'LIENG' | 'TAIXIU';

interface BotPlayer3Cay {
  id: string;
  name: string;
  role: string;
  cards: PlayingCard[];
  evalResult?: BaCayEval;
  outcomeVsPlayer?: 'WIN' | 'LOSE';
}

interface BotPlayerLieng {
  id: string;
  name: string;
  persona: string;
  cards: PlayingCard[];
  folded: boolean;
  betInPot: number;
  statusText: string;
  evalResult?: LiengEval;
}

type TaiXiuBetSpot =
  | 'TAI'
  | 'XIU'
  | 'CHAN'
  | 'LE'
  | 'BAO_ANY'
  | 'SUM_4'
  | 'SUM_5'
  | 'SUM_6'
  | 'SUM_7'
  | 'SUM_8'
  | 'SUM_9'
  | 'SUM_10'
  | 'SUM_11'
  | 'SUM_12'
  | 'SUM_13'
  | 'SUM_14'
  | 'SUM_15'
  | 'SUM_16'
  | 'SUM_17';

const SUM_PAYOUTS: Record<number, number> = {
  4: 50,
  5: 18,
  6: 14,
  7: 12,
  8: 8,
  9: 6,
  10: 6,
  11: 6,
  12: 6,
  13: 8,
  14: 12,
  15: 14,
  16: 18,
  17: 50,
};

const CHIP_VALUES = [50_000, 200_000, 500_000, 2_000_000, 10_000_000];

const DICE_PIP_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function renderDieFace(value: number, idx: number) {
  const isRedPip = value === 1 || value === 4;
  const activePips = DICE_PIP_POSITIONS[value] || [4];
  return (
    <div
      key={idx}
      className="w-13 h-13 rounded-xl bg-white border-2 border-slate-300 shadow-lg p-1.5 grid grid-cols-3 grid-rows-3 gap-0.5 place-items-center"
    >
      {Array.from({ length: 9 }, (_, cell) => {
        const hasDot = activePips.includes(cell);
        if (!hasDot) return <span key={cell} className="w-2 h-2" />;
        return (
          <span
            key={cell}
            className={`rounded-full ${
              value === 1
                ? 'w-3.5 h-3.5 bg-[#DC2626]'
                : isRedPip
                ? 'w-2.5 h-2.5 bg-[#DC2626]'
                : 'w-2.5 h-2.5 bg-[#0F172A]'
            }`}
          />
        );
      })}
    </div>
  );
}

export const CasinoArena: React.FC<CasinoArenaProps> = ({
  cash,
  energy,
  initialGame = 'TAIXIU',
  onUpdateCasinoResult,
  onNavigateFinance,
}) => {
  const [activeGame, setActiveGame] = useState<CasinoGameTab>(initialGame);
  const [selectedChip, setSelectedChip] = useState<number>(200_000);

  // ==================== 1. STATE BÀI 3 CÂY ====================
  const [baCayBet, setBaCayBet] = useState<number>(200_000);
  const [baCayPhase, setBaCayPhase] = useState<'IDLE' | 'SQUEEZING' | 'RESULT'>('IDLE');
  const [player3CayCards, setPlayer3CayCards] = useState<PlayingCard[]>([]);
  const [bots3Cay, setBots3Cay] = useState<BotPlayer3Cay[]>([
    { id: 'bot1', name: 'Lão Hạc Đỏ Đen', role: 'Tay chơi lão luyện', cards: [] },
    { id: 'bot2', name: 'Phú Bà Quận 1', role: 'Đại gia cầm chương', cards: [] },
    { id: 'bot3', name: 'Tuấn Cò Quay', role: 'Con bạc khát nước', cards: [] },
  ]);
  const [baCaySummary, setBaCaySummary] = useState<{
    netCash: number;
    message: string;
    playerEval?: BaCayEval;
  } | null>(null);

  // ==================== 2. STATE BÀI LIÊNG ====================
  const [liengAnte, setLiengAnte] = useState<number>(200_000);
  const [liengPhase, setLiengPhase] = useState<'IDLE' | 'BETTING' | 'SHOWDOWN'>('IDLE');
  const [liengPot, setLiengPot] = useState<number>(0);
  const [playerLiengCards, setPlayerLiengCards] = useState<PlayingCard[]>([]);
  const [playerLiengBet, setPlayerLiengBet] = useState<number>(0);
  const [botsLieng, setBotsLieng] = useState<BotPlayerLieng[]>([
    {
      id: 'lbot1',
      name: 'Hùng Bến Cảng',
      persona: 'Hay tố láo dọa làng',
      cards: [],
      folded: false,
      betInPot: 0,
      statusText: 'Sẵn sàng',
    },
    {
      id: 'lbot2',
      name: 'Cô Ba Sài Gòn',
      persona: 'Chắc bài mới theo',
      cards: [],
      folded: false,
      betInPot: 0,
      statusText: 'Sẵn sàng',
    },
    {
      id: 'lbot3',
      name: 'Khánh Bảnh Tỉnh Lẻ',
      persona: 'Máu liều thích tất tay',
      cards: [],
      folded: false,
      betInPot: 0,
      statusText: 'Sẵn sàng',
    },
  ]);
  const [liengResultText, setLiengResultText] = useState<{
    winnerName: string;
    netDelta: number;
    detail: string;
  } | null>(null);

  // ==================== 3. STATE TÀI XỈU ====================
  const [taiXiuBets, setTaiXiuBets] = useState<Partial<Record<TaiXiuBetSpot, number>>>({});
  const [taiXiuPhase, setTaiXiuPhase] = useState<'BETTING' | 'SHAKING' | 'SQUEEZE_BOWL' | 'REVEALED'>('BETTING');
  const [diceValues, setDiceValues] = useState<[number, number, number]>([4, 5, 6]);
  const [bowlOffsetPercent, setBowlOffsetPercent] = useState<number>(0); // 0 = закрыто, 100 = mở bát hoàn toàn
  const [taiXiuHistory, setTaiXiuHistory] = useState<
    { sum: number; type: 'TÀI' | 'XỈU' | 'BÃO'; dice: [number, number, number] }[]
  >([
    { sum: 11, type: 'TÀI', dice: [3, 4, 4] },
    { sum: 8, type: 'XỈU', dice: [2, 2, 4] },
    { sum: 14, type: 'TÀI', dice: [5, 5, 4] },
    { sum: 9, type: 'XỈU', dice: [1, 3, 5] },
    { sum: 12, type: 'TÀI', dice: [6, 4, 2] },
  ]);
  const [taiXiuLastOutcome, setTaiXiuLastOutcome] = useState<{
    netProfit: number;
    totalReturn: number;
    summaryText: string;
  } | null>(null);

  // ==================== LOGIC BÀI 3 CÂY ====================
  const startBaCayRound = () => {
    const totalMaxRisk = baCayBet * 3; // Đấu với 3 nhà trên bàn
    if (cash < totalMaxRisk) {
      sound.playWarning();
      return;
    }
    sound.playCardFlip();
    const deck = create3CayDeck();
    const pCards = deck.slice(0, 3).map((c) => ({ ...c, faceUp: false }));
    const b1Cards = deck.slice(3, 6).map((c) => ({ ...c, faceUp: false }));
    const b2Cards = deck.slice(6, 9).map((c) => ({ ...c, faceUp: false }));
    const b3Cards = deck.slice(9, 12).map((c) => ({ ...c, faceUp: false }));

    setPlayer3CayCards(pCards);
    setBots3Cay([
      { id: 'bot1', name: 'Lão Hạc Đỏ Đen', role: 'Tay chơi lão luyện', cards: b1Cards },
      { id: 'bot2', name: 'Phú Bà Quận 1', role: 'Đại gia cầm chương', cards: b2Cards },
      { id: 'bot3', name: 'Tuấn Cò Quay', role: 'Con bạc khát nước', cards: b3Cards },
    ]);
    setBaCaySummary(null);
    setBaCayPhase('SQUEEZING');
  };

  const flipSingle3CayCard = (index: number) => {
    if (baCayPhase !== 'SQUEEZING') return;
    sound.playCardFlip();
    const updated = player3CayCards.map((c, idx) =>
      idx === index ? { ...c, faceUp: true } : c
    );
    setPlayer3CayCards(updated);
    if (updated.every((c) => c.faceUp)) {
      finalizeBaCayShowdown(updated);
    }
  };

  const finalizeBaCayShowdown = (currentCards?: PlayingCard[]) => {
    const pCards = (currentCards || player3CayCards).map((c) => ({ ...c, faceUp: true }));
    setPlayer3CayCards(pCards);

    const playerEval = evaluate3CayHand(pCards);
    let netCash = 0;
    let wins = 0;
    let losses = 0;

    const revealedBots = bots3Cay.map((bot) => {
      const revealedCards = bot.cards.map((c) => ({ ...c, faceUp: true }));
      const botEval = evaluate3CayHand(revealedCards);
      const playerWins = playerEval.scoreValue > botEval.scoreValue;

      // Hệ số nhân thưởng chuẩn 3 Cây: Sáp x3, 10 Át Rô (Củ Rùa) x2, 10 thường x2, còn lại x1
      let multiplier = 1;
      const winnerEval = playerWins ? playerEval : botEval;
      if (winnerEval.isSap) multiplier = 3;
      else if (winnerEval.points === 10) multiplier = 2;

      const stake = baCayBet * multiplier;
      if (playerWins) {
        netCash += stake;
        wins++;
      } else {
        netCash -= stake;
        losses++;
      }

      return {
        ...bot,
        cards: revealedCards,
        evalResult: botEval,
        outcomeVsPlayer: (playerWins ? 'WIN' : 'LOSE') as 'WIN' | 'LOSE',
      };
    });

    setBots3Cay(revealedBots);
    setBaCayPhase('RESULT');

    if (netCash >= 0) {
      sound.playWin();
    } else {
      sound.playLose();
    }

    const msg =
      netCash >= 0
        ? `Thắng ${wins}/3 nhà! Bài của bạn: ${playerEval.label} · Lãi ròng +${formatVND(netCash)}`
        : `Thua ${losses}/3 nhà! Bài của bạn: ${playerEval.label} · Thiệt hại ${formatVND(netCash)}`;

    setBaCaySummary({
      netCash,
      message: msg,
      playerEval,
    });

    onUpdateCasinoResult(
      netCash,
      netCash >= 0 ? 6 : -8,
      -4,
      'BACAY',
      `Ván 3 Cây (${playerEval.label})`,
      msg
    );
  };

  // ==================== LOGIC BÀI LIÊNG ====================
  const startLiengRound = () => {
    if (cash < liengAnte) {
      sound.playWarning();
      return;
    }
    sound.playCardFlip();
    const deck = createLiengDeck();
    const pCards = deck.slice(0, 3).map((c) => ({ ...c, faceUp: true }));
    const b1Cards = deck.slice(3, 6).map((c) => ({ ...c, faceUp: false }));
    const b2Cards = deck.slice(6, 9).map((c) => ({ ...c, faceUp: false }));
    const b3Cards = deck.slice(9, 12).map((c) => ({ ...c, faceUp: false }));

    const initialPot = liengAnte * 4;
    setPlayerLiengCards(pCards);
    setPlayerLiengBet(liengAnte);
    setLiengPot(initialPot);
    setBotsLieng([
      {
        id: 'lbot1',
        name: 'Hùng Bến Cảng',
        persona: 'Hay tố láo dọa làng',
        cards: b1Cards,
        folded: false,
        betInPot: liengAnte,
        statusText: `Đã vào gà ${formatCompactVND(liengAnte)}`,
      },
      {
        id: 'lbot2',
        name: 'Cô Ba Sài Gòn',
        persona: 'Chắc bài mới theo',
        cards: b2Cards,
        folded: false,
        betInPot: liengAnte,
        statusText: `Đã vào gà ${formatCompactVND(liengAnte)}`,
      },
      {
        id: 'lbot3',
        name: 'Khánh Bảnh Tỉnh Lẻ',
        persona: 'Máu liều thích tất tay',
        cards: b3Cards,
        folded: false,
        betInPot: liengAnte,
        statusText: `Đã vào gà ${formatCompactVND(liengAnte)}`,
      },
    ]);
    setLiengResultText(null);
    setLiengPhase('BETTING');
  };

  const handleLiengAction = (action: 'FOLD' | 'CALL' | 'RAISE_1X' | 'RAISE_2X') => {
    if (liengPhase !== 'BETTING') return;

    // Nếu người chơi Úp Bỏ ngay lập tức: mất tiền gà ban đầu
    if (action === 'FOLD') {
      sound.playLose();
      const revealedBots = botsLieng.map((b) => {
        const revealed = b.cards.map((c) => ({ ...c, faceUp: true }));
        return {
          ...b,
          cards: revealed,
          evalResult: evaluateLiengHand(revealed),
        };
      });
      setBotsLieng(revealedBots);
      setLiengPhase('SHOWDOWN');
      setLiengResultText({
        winnerName: 'Bạn đã Úp Bỏ',
        netDelta: -playerLiengBet,
        detail: `Bạn chấp nhận úp bài chịu mất tiền sàn ${formatVND(playerLiengBet)} để bảo toàn vốn.`,
      });
      onUpdateCasinoResult(
        -playerLiengBet,
        -3,
        -3,
        'LIENG',
        'Úp bỏ ván Liêng',
        `Mất tiền sàn ${formatVND(playerLiengBet)}`
      );
      return;
    }

    const extraBet =
      action === 'CALL'
        ? liengAnte
        : action === 'RAISE_1X'
        ? liengAnte * 2
        : liengAnte * 4;

    if (cash < playerLiengBet + extraBet) {
      sound.playWarning();
      return;
    }

    const totalPlayerContribution = playerLiengBet + extraBet;
    let newPot = liengPot + extraBet;

    // Các Bot quyết định Theo hay Úp Bỏ dựa trên độ mạnh bài + tính cách bluff
    const updatedBots = botsLieng.map((bot, idx) => {
      const botEval = evaluateLiengHand(bot.cards);
      const isStrong = botEval.category !== 'DIEM' || botEval.points >= 7;
      const isMedium = botEval.points >= 5;
      const bluffRoll = Math.random();

      let willCall = false;
      if (isStrong) {
        willCall = true;
      } else if (idx === 0 && (isMedium || bluffRoll < 0.55)) {
        // Hùng Bến Cảng hay bluff
        willCall = true;
      } else if (idx === 1 && isMedium && action === 'CALL') {
        // Cô Ba chắc chắn
        willCall = true;
      } else if (idx === 2 && (isMedium || bluffRoll < 0.65)) {
        // Khánh Bảnh máu liều
        willCall = true;
      }

      // Đảm bảo ít nhất 1 bot theo nếu bài bot không quá tệ hoặc khi người chơi chỉ Call
      if (!willCall && idx === 2 && action === 'CALL') {
        willCall = true;
      }

      const revealedCards = bot.cards.map((c) => ({ ...c, faceUp: true }));

      if (willCall) {
        newPot += extraBet;
        return {
          ...bot,
          cards: revealedCards,
          folded: false,
          betInPot: bot.betInPot + extraBet,
          statusText: `Theo tố (+${formatCompactVND(extraBet)})`,
          evalResult: botEval,
        };
      } else {
        return {
          ...bot,
          cards: revealedCards,
          folded: true,
          statusText: 'Úp bỏ!',
          evalResult: botEval,
        };
      }
    });

    const playerEval = evaluateLiengHand(playerLiengCards);
    const activeBots = updatedBots.filter((b) => !b.folded);

    let bestContenderName = 'Bạn';
    let bestScore = playerEval.scoreValue;
    let bestLabel = playerEval.label;

    for (const bot of activeBots) {
      if (bot.evalResult && bot.evalResult.scoreValue > bestScore) {
        bestScore = bot.evalResult.scoreValue;
        bestContenderName = bot.name;
        bestLabel = bot.evalResult.label;
      }
    }

    const playerWon = bestContenderName === 'Bạn';
    const netDelta = playerWon
      ? newPot - totalPlayerContribution
      : -totalPlayerContribution;

    if (playerWon) {
      sound.playWin();
    } else {
      sound.playLose();
    }

    setPlayerLiengBet(totalPlayerContribution);
    setLiengPot(newPot);
    setBotsLieng(updatedBots);
    setLiengPhase('SHOWDOWN');

    const detail = playerWon
      ? `Bài của bạn (${playerEval.label}) ăn trọn gà ${formatVND(newPot)}! Lãi ròng +${formatVND(netDelta)}.`
      : `${bestContenderName} thắng gà với bộ bài ${bestLabel}. Bạn mất ${formatVND(totalPlayerContribution)}.`;

    setLiengResultText({
      winnerName: bestContenderName,
      netDelta,
      detail,
    });

    onUpdateCasinoResult(
      netDelta,
      playerWon ? 8 : -9,
      -5,
      'LIENG',
      `Ván Liêng (${playerEval.label})`,
      detail
    );
  };

  // ==================== LOGIC TÀI XỈU ====================
  const totalTaiXiuBetOnTable = Object.values(taiXiuBets).reduce(
    (sum, val) => sum + (val || 0),
    0
  );

  const placeTaiXiuBet = (spot: TaiXiuBetSpot) => {
    if (taiXiuPhase !== 'BETTING') return;
    if (totalTaiXiuBetOnTable + selectedChip > cash) {
      sound.playWarning();
      return;
    }
    sound.playClick();
    setTaiXiuBets((prev) => ({
      ...prev,
      [spot]: (prev[spot] || 0) + selectedChip,
    }));
  };

  const clearTaiXiuBets = () => {
    if (taiXiuPhase !== 'BETTING') return;
    sound.playClick();
    setTaiXiuBets({});
  };

  const rollTaiXiuDice = (squeezeMode: boolean) => {
    if (totalTaiXiuBetOnTable <= 0 || totalTaiXiuBetOnTable > cash) {
      sound.playWarning();
      return;
    }
    sound.playDiceShake();
    setTaiXiuLastOutcome(null);
    setTaiXiuPhase('SHAKING');

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const nextDice: [number, number, number] = [d1, d2, d3];
    setDiceValues(nextDice);

    setTimeout(() => {
      if (squeezeMode) {
        setBowlOffsetPercent(20);
        setTaiXiuPhase('SQUEEZE_BOWL');
      } else {
        setBowlOffsetPercent(100);
        settleTaiXiuResult(nextDice);
      }
    }, 650);
  };

  const settleTaiXiuResult = (rolledDice: [number, number, number]) => {
    const [d1, d2, d3] = rolledDice;
    const sum = d1 + d2 + d3;
    const isBao = d1 === d2 && d2 === d3;
    const isTai = !isBao && sum >= 11 && sum <= 17;
    const isXiu = !isBao && sum >= 4 && sum <= 10;
    const isChan = !isBao && sum % 2 === 0;
    const isLe = !isBao && sum % 2 === 1;

    let totalReturn = 0; // Tổng tiền thu về (gồm gốc + thưởng của các cửa trúng)

    for (const [spotKey, amount] of Object.entries(taiXiuBets)) {
      const betAmt = amount || 0;
      if (betAmt <= 0) continue;
      const spot = spotKey as TaiXiuBetSpot;

      if (spot === 'TAI' && isTai) totalReturn += betAmt * 2;
      else if (spot === 'XIU' && isXiu) totalReturn += betAmt * 2;
      else if (spot === 'CHAN' && isChan) totalReturn += betAmt * 2;
      else if (spot === 'LE' && isLe) totalReturn += betAmt * 2;
      else if (spot === 'BAO_ANY' && isBao) totalReturn += betAmt * 31; // 1 ăn 30
      else if (spot.startsWith('SUM_')) {
        const targetSum = Number(spot.replace('SUM_', ''));
        if (sum === targetSum && SUM_PAYOUTS[targetSum]) {
          totalReturn += betAmt * (SUM_PAYOUTS[targetSum] + 1);
        }
      }
    }

    const netProfit = totalReturn - totalTaiXiuBetOnTable;
    const resultType: 'TÀI' | 'XỈU' | 'BÃO' = isBao
      ? 'BÃO'
      : sum >= 11
      ? 'TÀI'
      : 'XỈU';

    setTaiXiuHistory((prev) => [
      { sum, type: resultType, dice: rolledDice },
      ...prev.slice(0, 9),
    ]);

    const summaryText =
      netProfit >= 0
        ? `Kết quả: ${d1}-${d2}-${d3} (${sum} nút · ${resultType}) · Lãi ròng +${formatVND(netProfit)}`
        : `Kết quả: ${d1}-${d2}-${d3} (${sum} nút · ${resultType}) · Thua ${formatVND(netProfit)}`;

    setTaiXiuLastOutcome({
      netProfit,
      totalReturn,
      summaryText,
    });
    setTaiXiuPhase('REVEALED');

    if (netProfit >= 0) {
      sound.playWin();
    } else {
      sound.playLose();
    }

    onUpdateCasinoResult(
      netProfit,
      netProfit >= 0 ? 7 : -8,
      -3,
      'TAIXIU',
      `Tài Xỉu: ${sum} nút (${resultType})`,
      summaryText
    );
  };

  const resetTaiXiuForNextRound = () => {
    sound.playClick();
    setTaiXiuBets({});
    setTaiXiuLastOutcome(null);
    setBowlOffsetPercent(0);
    setTaiXiuPhase('BETTING');
  };

  const player3CayCurrentEval =
    player3CayCards.length === 3 && player3CayCards.every((c) => c.faceUp)
      ? evaluate3CayHand(player3CayCards)
      : null;

  const playerLiengCurrentEval =
    playerLiengCards.length === 3 ? evaluateLiengHand(playerLiengCards) : null;

  return (
    <div className="space-y-6">
      {/* Banner Chiếu Bạc Đỏ Đen */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="aspect-[21/7] w-full relative overflow-hidden bg-slate-950">
          <img
            src={casinoBannerImg}
            alt="Chiếu bạc truyền thống Việt Nam với bài Tây, bát đĩa Tài Xỉu và các cọc tiền 500k"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-amber-300 mb-1">
                Sới Bạc Ngầm Khu Phố · Cầm Chương & Xóc Đĩa
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                Chiếu Bạc Đỏ Đen: 3 Cây · Liêng · Tài Xỉu
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Thắng làm vua, thua ra tiệm cầm đồ Anh Long bốc bát họ. Luật chơi chuẩn truyền thống Việt Nam, có nặn bài và mở bát trực tiếp.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                <div className="text-xs text-slate-400">Vốn tiền mặt hiện có</div>
                <div className="text-lg font-mono font-semibold text-emerald-400 tabular-nums">
                  {formatVND(cash)}
                </div>
              </div>
              {cash < 200_000 && (
                <button
                  type="button"
                  onClick={onNavigateFinance}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cạn Vốn? Đi Vay Nóng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bộ chọn trò chơi (Segmented Control) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('BACAY');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeGame === 'BACAY'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            01. Bài 3 Cây (Cào Rùa)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('LIENG');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeGame === 'LIENG'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            02. Bài Liêng (Cào Tố 3 Lá)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('TAIXIU');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeGame === 'TAIXIU'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            03. Tài Xỉu Xí Ngầu (Nặn Bát)
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Thứ tự chất chuẩn VN: <span className="text-red-400 font-semibold">Rô ♦</span> &gt;{' '}
          <span className="text-red-400 font-semibold">Cơ ♥</span> &gt;{' '}
          <span className="text-slate-200 font-semibold">Tép ♣</span> &gt;{' '}
          <span className="text-slate-200 font-semibold">Bích ♠</span> · Thể lực hiện tại: {energy}/100
        </div>
      </div>

      {/* ==================== GAME 1: BÀI 3 CÂY ==================== */}
      {activeGame === 'BACAY' && (
        <div className="rounded-2xl border border-emerald-800/60 bg-[#0F5132] p-6 shadow-xl space-y-6">
          {/* Thanh điều khiển cược 3 Cây */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-700/50">
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Sới Bài 3 Cây Cầm Chương (Bộ 36 Lá A–9)
              </h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Đấu điểm trực tiếp với 3 nhà trên chiếu · 10 nước nhân đôi (x2) · Sáp 3 lá nhân ba (x3) · Át Rô (A♦) là Củ Rùa lớn nhất
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CHIP_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={baCayPhase === 'SQUEEZING'}
                  onClick={() => {
                    sound.playClick();
                    setBaCayBet(val);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    baCayBet === val
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-emerald-900/80 text-emerald-100 hover:bg-emerald-800'
                  }`}
                >
                  {formatCompactVND(val)}/nhà
                </button>
              ))}
            </div>
          </div>

          {/* 3 Đối thủ trên chiếu 3 Cây */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bots3Cay.map((bot) => (
              <div
                key={bot.id}
                className="rounded-xl bg-emerald-950/65 border border-emerald-700/50 p-4 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{bot.name}</div>
                    <div className="text-xs text-emerald-300/75">{bot.role}</div>
                  </div>
                  {bot.outcomeVsPlayer && (
                    <span
                      className={`text-xs font-semibold font-mono ${
                        bot.outcomeVsPlayer === 'WIN' ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {bot.outcomeVsPlayer === 'WIN' ? 'Bạn Thắng' : 'Bạn Thua'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 min-h-[84px]">
                  {bot.cards.length > 0 ? (
                    bot.cards.map((c, idx) => (
                      <PlayingCardView key={idx} card={c} size="sm" />
                    ))
                  ) : (
                    <div className="text-xs text-emerald-300/60 italic">
                      Chờ chia bài...
                    </div>
                  )}
                </div>

                <div className="text-center text-xs font-mono text-amber-200 min-h-[18px]">
                  {bot.evalResult ? bot.evalResult.label : 'Úp bài'}
                </div>
              </div>
            ))}
          </div>

          {/* Khu vực Bài của Người Chơi */}
          <div className="rounded-xl bg-emerald-950/80 border border-amber-400/40 p-5 flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="text-xs text-emerald-200">
                Chiếu của bạn · Mức cược mỗi nhà:{' '}
                <span className="font-mono font-semibold text-amber-300">
                  {formatVND(baCayBet)}
                </span>{' '}
                (Cần tối thiểu {formatVND(baCayBet * 3)} để cân 3 nhà)
              </div>
              {player3CayCurrentEval && (
                <div className="mt-1 text-base font-mono font-bold text-amber-300">
                  {player3CayCurrentEval.label}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 min-h-[116px]">
              {player3CayCards.length > 0 ? (
                player3CayCards.map((c, idx) => (
                  <PlayingCardView
                    key={idx}
                    card={c}
                    size="md"
                    onClick={
                      baCayPhase === 'SQUEEZING' && !c.faceUp
                        ? () => flipSingle3CayCard(idx)
                        : undefined
                    }
                    interactiveHint="Bấm để nặn lá bài này"
                  />
                ))
              ) : (
                <div className="text-sm text-emerald-200/70 py-8">
                  Chọn mức cược bên trên và bấm &ldquo;Chia Bài 3 Cây&rdquo; để bắt đầu ván mới.
                </div>
              )}
            </div>

            {baCaySummary && (
              <div
                className={`w-full max-w-xl rounded-lg p-3 text-center text-sm font-medium border ${
                  baCaySummary.netCash >= 0
                    ? 'bg-emerald-900/70 border-emerald-400/50 text-emerald-100'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-100'
                }`}
              >
                {baCaySummary.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              {baCayPhase !== 'SQUEEZING' ? (
                <button
                  type="button"
                  onClick={startBaCayRound}
                  disabled={cash < baCayBet * 3}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  {cash < baCayBet * 3
                    ? `Cần tối thiểu ${formatCompactVND(baCayBet * 3)} để chia bài`
                    : `Chia Bài 3 Cây (${formatCompactVND(baCayBet)}/nhà)`}
                </button>
              ) : (
                <>
                  <span className="text-xs text-amber-200">
                    Bấm vào từng lá bài để nặn từ từ hoặc:
                  </span>
                  <button
                    type="button"
                    onClick={() => finalizeBaCayShowdown()}
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Lật Hết & So Điểm Ngay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== GAME 2: BÀI LIÊNG ==================== */}
      {activeGame === 'LIENG' && (
        <div className="rounded-2xl border border-amber-900/60 bg-[#3E2723] p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-800/50">
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Chiếu Bài Liêng Cào Tố 3 Lá (Bộ 52 Lá)
              </h2>
              <p className="text-xs text-amber-100/80 mt-0.5">
                Thứ tự: Sáp (3 lá giống nhau) &gt; Liêng (3 lá liên tiếp) &gt; Ảnh/Đĩ (3 lá Tây J, Q, K) &gt; Điểm (0–9 nút)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {CHIP_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={liengPhase === 'BETTING'}
                  onClick={() => {
                    sound.playClick();
                    setLiengAnte(val);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    liengAnte === val
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-stone-900/80 text-amber-100 hover:bg-stone-800'
                  }`}
                >
                  Sàn {formatCompactVND(val)}
                </button>
              ))}
            </div>
          </div>

          {/* Tổng Gà Giữa Chiếu */}
          <div className="flex items-center justify-between px-5 py-3 rounded-xl bg-stone-950/70 border border-amber-500/30">
            <div>
              <div className="text-xs text-amber-200/80">Tổng Tiền Gà Giữa Chiếu (Pot)</div>
              <div className="text-xl font-mono font-bold text-amber-400 tabular-nums">
                {formatVND(liengPot)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-stone-400">Tiền bạn đã bỏ vào ván này</div>
              <div className="text-sm font-mono font-semibold text-white tabular-nums">
                {formatVND(playerLiengBet)}
              </div>
            </div>
          </div>

          {/* 3 Đối Thủ Bài Liêng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {botsLieng.map((bot) => (
              <div
                key={bot.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                  bot.folded
                    ? 'bg-stone-950/40 border-stone-800 opacity-60'
                    : 'bg-stone-950/80 border-amber-700/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{bot.name}</div>
                    <div className="text-xs text-amber-200/70">{bot.persona}</div>
                  </div>
                  <span className="text-xs font-mono text-amber-300">{bot.statusText}</span>
                </div>

                <div className="flex items-center justify-center gap-2 min-h-[84px]">
                  {bot.cards.length > 0 ? (
                    bot.cards.map((c, idx) => (
                      <PlayingCardView key={idx} card={c} size="sm" />
                    ))
                  ) : (
                    <div className="text-xs text-stone-400 italic">Chờ chia bài...</div>
                  )}
                </div>

                <div className="text-center text-xs font-mono text-amber-200 min-h-[18px]">
                  {bot.evalResult ? bot.evalResult.label : 'Đang giữ bài kín'}
                </div>
              </div>
            ))}
          </div>

          {/* Bài của bạn & Nút Tố Liêng */}
          <div className="rounded-xl bg-stone-950/90 border border-amber-500/40 p-5 flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="text-xs text-stone-300">Bài trên tay bạn</div>
              {playerLiengCurrentEval && (
                <div className="mt-1 text-base font-mono font-bold text-amber-300">
                  {playerLiengCurrentEval.label}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 min-h-[116px]">
              {playerLiengCards.length > 0 ? (
                playerLiengCards.map((c, idx) => (
                  <PlayingCardView key={idx} card={c} size="md" />
                ))
              ) : (
                <div className="text-sm text-stone-400 py-8">
                  Bấm &ldquo;Vào Gà & Chia Bài Liêng&rdquo; để bắt đầu ván đấu trí.
                </div>
              )}
            </div>

            {liengResultText && (
              <div
                className={`w-full max-w-xl rounded-lg p-3 text-center text-sm font-medium border ${
                  liengResultText.netDelta >= 0
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}
              >
                {liengResultText.detail}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              {liengPhase !== 'BETTING' ? (
                <button
                  type="button"
                  onClick={startLiengRound}
                  disabled={cash < liengAnte}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-stone-800 disabled:text-stone-500 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  {cash < liengAnte
                    ? `Không đủ tiền sàn (${formatCompactVND(liengAnte)})`
                    : `Vào Gà & Chia Bài Liêng (${formatCompactVND(liengAnte)})`}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleLiengAction('FOLD')}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Úp Bỏ (Chịu mất {formatCompactVND(liengAnte)})
                  </button>
                  <button
                    type="button"
                    disabled={cash < playerLiengBet + liengAnte}
                    onClick={() => handleLiengAction('CALL')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Theo Cơ Bản (+{formatCompactVND(liengAnte)})
                  </button>
                  <button
                    type="button"
                    disabled={cash < playerLiengBet + liengAnte * 2}
                    onClick={() => handleLiengAction('RAISE_1X')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Tố Căng (+{formatCompactVND(liengAnte * 2)})
                  </button>
                  <button
                    type="button"
                    disabled={cash < playerLiengBet + liengAnte * 4}
                    onClick={() => handleLiengAction('RAISE_2X')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Tố Tất Tay Đè Làng (+{formatCompactVND(liengAnte * 4)})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== GAME 3: TÀI XỈU XÓC ĐĨA ==================== */}
      {activeGame === 'TAIXIU' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
          {/* Header & Chọn phỉnh cược */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Sới Tài Xỉu Lắc Xí Ngầu 3 Viên (Có Nặn Bát)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Xỉu: 4–10 nút (1 ăn 1) · Tài: 11–17 nút (1 ăn 1) · Bão 3 viên giống nhau (1 ăn 30, nhà cái ăn Tài/Xỉu/Chẵn/Lẻ)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Chọn mệnh giá phỉnh:</span>
              {CHIP_VALUES.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSelectedChip(chip);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedChip === chip
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  +{formatCompactVND(chip)}
                </button>
              ))}
            </div>
          </div>

          {/* Cầu Tài Xỉu gần nhất */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-medium text-slate-400">
              Bảng Cầu 10 Phiên Gần Nhất:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {taiXiuHistory.map((h, i) => (
                <span
                  key={i}
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                    h.type === 'TÀI'
                      ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                      : h.type === 'XỈU'
                      ? 'bg-sky-950/80 border-sky-500/40 text-sky-200'
                      : 'bg-amber-950/80 border-amber-400/50 text-amber-200'
                  }`}
                >
                  {h.type} {h.sum}
                </span>
              ))}
            </div>
          </div>

          {/* Bàn Cược Chính: XỈU - BÁT ĐĨA - TÀI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Cửa XỈU & LẺ */}
            <div className="space-y-3 flex flex-col justify-between">
              <button
                type="button"
                onClick={() => placeTaiXiuBet('XIU')}
                disabled={taiXiuPhase !== 'BETTING'}
                className={`w-full flex-1 rounded-2xl p-5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  taiXiuBets.XIU
                    ? 'bg-sky-950/80 border-sky-400 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-display font-bold text-sky-300">XỈU</span>
                  <span className="text-xs font-mono text-slate-400">4 – 10 Nút · 1 Ăn 1</span>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-slate-400">Tiền đặt cửa Xỉu:</div>
                  <div className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                    {formatVND(taiXiuBets.XIU || 0)}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => placeTaiXiuBet('LE')}
                disabled={taiXiuPhase !== 'BETTING'}
                className={`w-full rounded-xl p-4 border text-left transition-all cursor-pointer flex items-center justify-between ${
                  taiXiuBets.LE
                    ? 'bg-sky-950/60 border-sky-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-base font-bold text-white">Cửa LẺ</div>
                  <div className="text-xs text-slate-400">5, 7, 9, 11, 13, 15, 17 · 1 Ăn 1</div>
                </div>
                <div className="text-sm font-mono font-semibold text-amber-300 tabular-nums">
                  {formatCompactVND(taiXiuBets.LE || 0)}
                </div>
              </button>
            </div>

            {/* Giữa bàn: Đĩa & Bát Hoa Sứ + Nặn Bát */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex flex-col items-center justify-between space-y-4">
              <div className="text-center">
                <div className="text-xs font-medium text-amber-300">
                  Đĩa Sứ Bát Tràng & 3 Viên Xí Ngầu
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Tổng tiền đã đặt trên chiếu:{' '}
                  <span className="font-mono font-semibold text-white">
                    {formatVND(totalTaiXiuBetOnTable)}
                  </span>
                </div>
              </div>

              {/* Đĩa và 3 Viên Xúc Xắc */}
              <div className="relative w-48 h-48 rounded-full border-4 border-amber-500/40 bg-stone-900 shadow-inner flex items-center justify-center overflow-hidden">
                {/* 3 Viên Xúc Xắc bên dưới bát */}
                <div className="flex items-center justify-center gap-2">
                  {diceValues.map((val, idx) => renderDieFace(val, idx))}
                </div>

                {/* Chiếc Bát Úp Lên Đĩa */}
                {taiXiuPhase !== 'BETTING' && bowlOffsetPercent < 100 && (
                  <div
                    style={{
                      transform: `translate3d(${bowlOffsetPercent * 1.35}px, -${
                        bowlOffsetPercent * 0.45
                      }px, 0)`,
                    }}
                    className={`absolute inset-2 rounded-full bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950 border-4 border-sky-300/60 shadow-2xl flex flex-col items-center justify-center select-none transition-transform duration-150 ${
                      taiXiuPhase === 'SHAKING' ? 'animate-shake-dice' : ''
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-sky-300/40 flex items-center justify-center text-sky-200 font-display text-xs">
                      Bát Hoa
                    </div>
                    <span className="text-[11px] text-sky-200/90 mt-1 font-medium">
                      {taiXiuPhase === 'SHAKING' ? 'Đang xóc đĩa...' : 'Kéo thanh trượt để nặn bát'}
                    </span>
                  </div>
                )}
              </div>

              {/* Điều khiển Nặn Bát hoặc Xóc Đĩa */}
              {taiXiuPhase === 'SQUEEZE_BOWL' && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-200">
                    <span>Kéo từ từ để nặn bát:</span>
                    <span className="font-mono">{bowlOffsetPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={bowlOffsetPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBowlOffsetPercent(val);
                      if (val >= 92) {
                        setBowlOffsetPercent(100);
                        settleTaiXiuResult(diceValues);
                      }
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBowlOffsetPercent(100);
                      settleTaiXiuResult(diceValues);
                    }}
                    className="w-full py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Mở Toang Bát Ngay!
                  </button>
                </div>
              )}

              {/* Cược Bão Bất Kỳ (1 ăn 30) */}
              <button
                type="button"
                onClick={() => placeTaiXiuBet('BAO_ANY')}
                disabled={taiXiuPhase !== 'BETTING'}
                className={`w-full rounded-xl p-3 border text-center transition-all cursor-pointer ${
                  taiXiuBets.BAO_ANY
                    ? 'bg-amber-950/80 border-amber-400'
                    : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div className="text-xs font-bold text-amber-300">
                  CƯỢC BỘ BA ĐỒNG NHẤT (BÃO BẤT KỲ · 1 ĂN 30)
                </div>
                <div className="text-xs font-mono text-white mt-0.5">
                  Đã đặt: {formatVND(taiXiuBets.BAO_ANY || 0)}
                </div>
              </button>
            </div>

            {/* Cửa TÀI & CHẴN */}
            <div className="space-y-3 flex flex-col justify-between">
              <button
                type="button"
                onClick={() => placeTaiXiuBet('TAI')}
                disabled={taiXiuPhase !== 'BETTING'}
                className={`w-full flex-1 rounded-2xl p-5 border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  taiXiuBets.TAI
                    ? 'bg-rose-950/80 border-rose-400 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-display font-bold text-rose-400">TÀI</span>
                  <span className="text-xs font-mono text-slate-400">11 – 17 Nút · 1 Ăn 1</span>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-slate-400">Tiền đặt cửa Tài:</div>
                  <div className="text-lg font-mono font-bold text-amber-300 tabular-nums">
                    {formatVND(taiXiuBets.TAI || 0)}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => placeTaiXiuBet('CHAN')}
                disabled={taiXiuPhase !== 'BETTING'}
                className={`w-full rounded-xl p-4 border text-left transition-all cursor-pointer flex items-center justify-between ${
                  taiXiuBets.CHAN
                    ? 'bg-rose-950/60 border-rose-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-base font-bold text-white">Cửa CHẴN</div>
                  <div className="text-xs text-slate-400">4, 6, 8, 10, 12, 14, 16 · 1 Ăn 1</div>
                </div>
                <div className="text-sm font-mono font-semibold text-amber-300 tabular-nums">
                  {formatCompactVND(taiXiuBets.CHAN || 0)}
                </div>
              </button>
            </div>
          </div>

          {/* Hàng Cược Tổng Điểm Cụ Thể (4 đến 17) */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-400">
              Cược Tổng Điểm Chính Xác (Tỷ lệ ăn cao từ 1:6 đến 1:50):
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
              {Array.from({ length: 14 }, (_, i) => i + 4).map((sumVal) => {
                const spotKey = `SUM_${sumVal}` as TaiXiuBetSpot;
                const betAmt = taiXiuBets[spotKey] || 0;
                return (
                  <button
                    key={sumVal}
                    type="button"
                    disabled={taiXiuPhase !== 'BETTING'}
                    onClick={() => placeTaiXiuBet(spotKey)}
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      betAmt > 0
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-sm font-mono font-bold">{sumVal}</div>
                    <div className="text-[10px] text-slate-400">1:{SUM_PAYOUTS[sumVal]}</div>
                    {betAmt > 0 && (
                      <div className="text-[10px] font-mono text-amber-300 mt-0.5 truncate">
                        {formatCompactVND(betAmt)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thông báo kết quả Tài Xỉu & Nút Hành Động */}
          {taiXiuLastOutcome && (
            <div
              className={`rounded-xl p-4 text-center text-sm font-medium border ${
                taiXiuLastOutcome.netProfit >= 0
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              }`}
            >
              {taiXiuLastOutcome.summaryText}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {taiXiuPhase === 'BETTING' && (
              <>
                <button
                  type="button"
                  onClick={clearTaiXiuBets}
                  disabled={totalTaiXiuBetOnTable === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xóa Cược
                </button>
                <button
                  type="button"
                  disabled={cash <= 0}
                  onClick={() => {
                    sound.playClick();
                    setTaiXiuBets({ XIU: cash });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Tất Tay XỈU ({formatCompactVND(cash)})
                </button>
                <button
                  type="button"
                  disabled={cash <= 0}
                  onClick={() => {
                    sound.playClick();
                    setTaiXiuBets({ TAI: cash });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Tất Tay TÀI ({formatCompactVND(cash)})
                </button>
                <button
                  type="button"
                  disabled={
                    totalTaiXiuBetOnTable === 0 ||
                    totalTaiXiuBetOnTable * 2 > cash
                  }
                  onClick={() => {
                    sound.playClick();
                    const doubled: Partial<Record<TaiXiuBetSpot, number>> = {};
                    for (const [k, v] of Object.entries(taiXiuBets)) {
                      doubled[k as TaiXiuBetSpot] = (v || 0) * 2;
                    }
                    setTaiXiuBets(doubled);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Gấp Thếp x2 Cược
                </button>
                <button
                  type="button"
                  onClick={() => rollTaiXiuDice(false)}
                  disabled={totalTaiXiuBetOnTable === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xóc Đĩa & Mở Bát Ngay
                </button>
                <button
                  type="button"
                  onClick={() => rollTaiXiuDice(true)}
                  disabled={totalTaiXiuBetOnTable === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
                >
                  Xóc Đĩa & Tự Tay Nặn Bát
                </button>
              </>
            )}

            {taiXiuPhase === 'REVEALED' && (
              <button
                type="button"
                onClick={resetTaiXiuForNextRound}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                Đặt Cược Phiên Tiếp Theo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
