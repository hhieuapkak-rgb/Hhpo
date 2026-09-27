import React, { useState, useEffect } from 'react';
import {
  GameScreenState,
  ActiveTab,
  PlayerState,
  JournalEntry,
  JOBS_DATA,
  STREET_FOOD_DATA,
  HOUSING_DATA,
  ASSETS_DATA,
  RANDOM_EVENTS,
  RandomLifeEvent,
  JobOption,
  FoodOrServiceItem,
  HousingTier,
  AssetItem,
  SharkLoanPackage,
  CHARACTER_BACKGROUNDS,
  STORY_CHAPTERS_DATA,
  StoryChoiceOption,
  WIFE_CANDIDATES_DATA,
  WifeCandidate,
  LIFE_ENDINGS_DATA,
  LifeEnding,
  CAREER_RANKS_DATA,
  TRAINING_COURSES_DATA,
  TrainingCourse,
  INVESTMENT_CHANNELS_DATA,
  InvestmentChannel,
} from './types/game';
import { CasinoArena } from './components/CasinoArena';
import { FinanceCenter } from './components/FinanceCenter';
import { StoryCampaign } from './components/StoryCampaign';
import {
  CareerPromotionPanel,
  InvestmentExchangePanel,
  RedBookMortgagePanel,
} from './components/CareerAndInvestmentPanels';
import { formatVND, formatCompactVND, sound } from './utils/sound';

import streetSceneImg from './assets/images/vietnam_street_scene_1790508060914.jpg';
import apartmentSceneImg from './assets/images/apartment_living_scene_1790508074952.jpg';
import avatarPortraitImg from './assets/images/player_avatar_portrait_1790508107658.jpg';
import hometownStoryImg from './assets/images/story_hometown_family_1790508919357.jpg';

const STORAGE_KEY = 'kiep_nhan_sinh_vn_save_v2';
const ENDINGS_STORAGE_KEY = 'kiep_nhan_sinh_vn_endings_v2';
const JOURNAL_STORAGE_KEY = 'kiep_nhan_sinh_vn_journal_v2';

const SAMPLE_VN_NAMES = [
  'Nguyễn Văn Nam',
  'Trần Minh Quân',
  'Lê Hoàng Long',
  'Phạm Tuấn Kiệt',
  'Vũ Đức Thắng',
  'Đặng Gia Huy',
  'Bùi Quang Hải',
  'Hoàng Đình Phong',
];

const HOMETOWN_PRESETS = [
  'Nam Định',
  'Hải Phòng',
  'Nghệ An',
  'Hà Nội',
  'Thái Bình',
  'Thanh Hóa',
  'Đà Nẵng',
  'Sài Gòn',
];

function createDefaultMarketPrices(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ch of INVESTMENT_CHANNELS_DATA) {
    map[ch.id] = ch.baseUnitPrice;
  }
  return map;
}

function createInitialPlayer(
  name = 'Nguyễn Văn Nam',
  hometown = 'Nam Định',
  backgroundId = 'sinh_vien_moi_ra_truong',
  startingAge = 22,
  initialFamilyDebt = 150_000_000
): PlayerState {
  const bg =
    CHARACTER_BACKGROUNDS.find((b) => b.id === backgroundId) ||
    CHARACTER_BACKGROUNDS[0];

  return {
    name,
    hometown,
    backgroundId: bg.id,
    backgroundTitle: bg.title,
    day: 1,
    age: startingAge,
    cash: bg.startingCash,
    bankSavings: bg.startingSavings,
    bankDebt: 0,
    bankDebtDueDay: null,
    sharkLoans: [],
    health: 100,
    maxHealth: 100,
    sanity: 90,
    energy: bg.startingMaxEnergy,
    maxEnergy: bg.startingMaxEnergy,
    reputation: bg.startingRep,
    workExp: bg.startingExp,
    careerRankIndex: 0,
    completedCourseIds: [],
    portfolio: [],
    marketPrices: createDefaultMarketPrices(),
    marketChanges: {},
    housingId: 'phong_tro_mai_ton',
    ownedHousingIds: [],
    assets: [],
    story: {
      currentChapter: 1,
      familyDebtRemaining: initialFamilyDebt,
      moneySentHomeTotal: 0,
      maiAnhAffection: bg.startingMaiAnh,
      underworldRespect: bg.startingUnderworld,
      karmaPath: 'CAN_BANG',
      completedChapters: [],
      endingTitle: null,
      activeEndingId: null,
    },
    family: {
      affectionMap: {
        mai_anh: bg.startingMaiAnh,
        thao_my: 10,
        ngoc_linh: 5,
      },
      marriedWifeId: null,
      weddingDay: null,
      maritalHappiness: 85,
      children: [],
    },
    stats: {
      totalEarnedWork: 0,
      totalWonCasino: 0,
      totalLostCasino: 0,
      baCayRounds: 0,
      liengRounds: 0,
      taiXiuRounds: 0,
    },
  };
}

function normalizeSavedPlayer(raw: unknown): PlayerState {
  const fallback = createInitialPlayer();
  if (!raw || typeof raw !== 'object') return fallback;
  const p = raw as Partial<PlayerState>;
  if (typeof p.cash !== 'number' || !p.story) return fallback;

  return {
    ...fallback,
    ...p,
    careerRankIndex:
      typeof p.careerRankIndex === 'number' ? p.careerRankIndex : 0,
    completedCourseIds: Array.isArray(p.completedCourseIds)
      ? p.completedCourseIds
      : [],
    portfolio: Array.isArray(p.portfolio) ? p.portfolio : [],
    marketPrices:
      p.marketPrices && typeof p.marketPrices === 'object'
        ? { ...createDefaultMarketPrices(), ...p.marketPrices }
        : createDefaultMarketPrices(),
    marketChanges:
      p.marketChanges && typeof p.marketChanges === 'object'
        ? p.marketChanges
        : {},
    assets: Array.isArray(p.assets) ? p.assets : [],
    ownedHousingIds: Array.isArray(p.ownedHousingIds) ? p.ownedHousingIds : [],
    sharkLoans: Array.isArray(p.sharkLoans) ? p.sharkLoans : [],
    story: {
      ...fallback.story,
      ...p.story,
      completedChapters: Array.isArray(p.story.completedChapters)
        ? p.story.completedChapters
        : [],
    },
    family: {
      affectionMap: {
        ...fallback.family.affectionMap,
        ...(p.family?.affectionMap || {}),
      },
      marriedWifeId: p.family?.marriedWifeId ?? null,
      weddingDay: p.family?.weddingDay ?? null,
      maritalHappiness:
        typeof p.family?.maritalHappiness === 'number'
          ? p.family.maritalHappiness
          : 85,
      children: Array.isArray(p.family?.children) ? p.family!.children : [],
    },
    stats: {
      ...fallback.stats,
      ...(p.stats || {}),
    },
  };
}

export default function App() {
  const [screenState, setScreenState] = useState<GameScreenState>('PLAYING');
  const [activeTab, setActiveTab] = useState<ActiveTab>('STORY');
  const [preferredCasinoGame, setPreferredCasinoGame] = useState<
    'BACAY' | 'LIENG' | 'TAIXIU'
  >('TAIXIU');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [player, setPlayer] = useState<PlayerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizeSavedPlayer(JSON.parse(saved));
      }
    } catch {
      // ignore localStorage errors
    }
    return createInitialPlayer();
  });

  const [unlockedEndings, setUnlockedEndings] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(ENDINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        day: 1,
        timeStr: '07:30',
        title: 'Chương 1: Cuộc Gọi Nửa Đêm Từ Quê Nhà',
        detail:
          'Bố ở quê bị nhóm Lão Hạc lừa thế chấp mảnh đất tổ tiên 150 triệu đồng và phải nhập viện cấp cứu. Bạn quyết tâm bám trụ nơi thành phố để kiếm tiền cứu gia đình!',
        type: 'info',
      },
    ];
  });

  // Đồng hồ Cốt truyện Thời gian thực (Từ 06:00 sáng đến 23:45 đêm)
  const [realTimeMinutes, setRealTimeMinutes] = useState<number>(7 * 60 + 30);
  const [realTimeSpeed, setRealTimeSpeed] = useState<'PAUSED' | '1X' | '3X'>(
    '1X'
  );
  const [activeEndingObject, setActiveEndingObject] =
    useState<LifeEnding | null>(null);

  const formatClock = (totalMins: number) => {
    const normalized = ((totalMins % 1440) + 1440) % 1440;
    const hh = Math.floor(normalized / 60)
      .toString()
      .padStart(2, '0');
    const mm = (normalized % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const getPeriodLabel = (totalMins: number) => {
    const hour = Math.floor((((totalMins % 1440) + 1440) % 1440) / 60);
    if (hour >= 5 && hour < 11) return 'Buổi Sáng Phố Thị';
    if (hour >= 11 && hour < 14) return 'Giờ Nghỉ Trưa';
    if (hour >= 14 && hour < 18) return 'Buổi Chiều Mưu Sinh';
    if (hour >= 18 && hour < 22) return 'Phố Lên Đèn';
    return 'Đêm Khuya';
  };

  const realTimeClockStr = formatClock(realTimeMinutes);
  const realTimePeriodLabel = getPeriodLabel(realTimeMinutes);

  const [toastBanner, setToastBanner] = useState<{
    title: string;
    detail: string;
    tone: 'positive' | 'negative' | 'info';
  } | null>(null);

  const [activeRandomEvent, setActiveRandomEvent] =
    useState<RandomLifeEvent | null>(null);

  // State cho Modal Tạo Nhân Vật & Chơi Lại Từ Đầu
  const [customNameInput, setCustomNameInput] = useState<string>(player.name);
  const [customHometownInput, setCustomHometownInput] = useState<string>(
    player.hometown
  );
  const [selectedBgId, setSelectedBgId] = useState<string>(
    player.backgroundId || 'sinh_vien_moi_ra_truong'
  );
  const [startingAgeInput, setStartingAgeInput] = useState<number>(22);
  const [startingDebtOption, setStartingDebtOption] =
    useState<number>(150_000_000);

  // State hiển thị hộp thoại cắt cảnh khi chuyển chương cốt truyện
  const [storyCutsceneModal, setStoryCutsceneModal] = useState<{
    chapterTitle: string;
    outcomeText: string;
    nextChapterNumber: number;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {
      // ignore
    }
  }, [player]);

  useEffect(() => {
    try {
      localStorage.setItem(
        ENDINGS_STORAGE_KEY,
        JSON.stringify(unlockedEndings)
      );
    } catch {
      // ignore
    }
  }, [unlockedEndings]);

  useEffect(() => {
    try {
      localStorage.setItem(
        JOURNAL_STORAGE_KEY,
        JSON.stringify(journal.slice(0, 80))
      );
    } catch {
      // ignore
    }
  }, [journal]);

  const unlockEndingById = (endingId: string) => {
    const found = LIFE_ENDINGS_DATA.find((e) => e.id === endingId);
    if (found) {
      setActiveEndingObject(found);
    }
    setUnlockedEndings((prev) =>
      prev.includes(endingId) ? prev : [...prev, endingId]
    );
  };

  const addLog = (
    title: string,
    detail: string,
    type: JournalEntry['type'] = 'info',
    dayOverride?: number,
    customExtra?: Partial<JournalEntry>
  ) => {
    const newEntry: JournalEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      day: dayOverride ?? player.day,
      timeStr: realTimeClockStr,
      title,
      detail,
      type,
      ...customExtra,
    };
    setJournal((prev) => [newEntry, ...prev.slice(0, 79)]);
    setToastBanner({
      title,
      detail,
      tone:
        type === 'positive'
          ? 'positive'
          : type === 'negative' || type === 'danger'
          ? 'negative'
          : 'info',
    });
  };

  // Nhịp sống thời gian thực & biến động giá thị trường tự động
  useEffect(() => {
    if (screenState !== 'PLAYING' || realTimeSpeed === 'PAUSED') return;
    const intervalMs = realTimeSpeed === '3X' ? 2500 : 6500;
    const timer = window.setInterval(() => {
      setRealTimeMinutes((prevMins) => {
        const nextMins = (prevMins + 15) % 1440;
        // Cứ mỗi 2 tiếng trong game (120 phút), cập nhật nhẹ bảng giá đầu tư
        if (nextMins % 120 === 0) {
          setPlayer((prevP) => {
            const nextPrices = { ...prevP.marketPrices };
            const nextChanges = { ...prevP.marketChanges };
            for (const ch of INVESTMENT_CHANNELS_DATA) {
              const cur = nextPrices[ch.id] || ch.baseUnitPrice;
              const swing =
                ch.minVolatility +
                Math.random() * (ch.maxVolatility - ch.minVolatility);
              const updated = Math.max(
                Math.round(ch.baseUnitPrice * 0.45),
                Math.round((cur * (1 + swing)) / 1000) * 1000
              );
              nextChanges[ch.id] = Number(
                (((updated - cur) / cur) * 100).toFixed(2)
              );
              nextPrices[ch.id] = updated;
            }
            return {
              ...prevP,
              marketPrices: nextPrices,
              marketChanges: nextChanges,
            };
          });
        }
        return nextMins;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [screenState, realTimeSpeed]);

  // Tính tổng giá trị tài sản ròng (Net Worth)
  const ownedAssetsTotalValue = player.assets.reduce((acc, owned) => {
    const item = ASSETS_DATA.find((a) => a.id === owned.assetId);
    if (!item) return acc;
    return acc + (owned.isPawned ? item.price - item.pawnValue : item.price);
  }, 0);

  const ownedHousingValue = player.ownedHousingIds.reduce((acc, hid) => {
    const h = HOUSING_DATA.find((x) => x.id === hid);
    return acc + (h?.purchasePrice || 0);
  }, 0);

  const portfolioTotalValue = player.portfolio.reduce((sum, item) => {
    const ch = INVESTMENT_CHANNELS_DATA.find((c) => c.id === item.channelId);
    const curPrice =
      player.marketPrices[item.channelId] || ch?.baseUnitPrice || 0;
    return sum + curPrice * item.units;
  }, 0);

  const totalSharkDebt = player.sharkLoans.reduce(
    (sum, l) => sum + l.principal + l.accruedInterest,
    0
  );

  const netWorth =
    player.cash +
    player.bankSavings +
    ownedAssetsTotalValue +
    ownedHousingValue +
    portfolioTotalValue -
    player.bankDebt -
    totalSharkDebt;

  // ==================== HÀNH ĐỘNG CỐT TRUYỆN & NPC ====================
  const handleSendMoneyHome = (amount: number) => {
    if (amount <= 0 || player.cash < amount) {
      sound.playWarning();
      return;
    }
    sound.playCoin();
    const debtReduced = Math.min(player.story.familyDebtRemaining, amount);

    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - amount,
      sanity: Math.min(100, prev.sanity + 8),
      reputation: Math.min(100, prev.reputation + 2),
      story: {
        ...prev.story,
        moneySentHomeTotal: prev.story.moneySentHomeTotal + amount,
        familyDebtRemaining: Math.max(
          0,
          prev.story.familyDebtRemaining - amount
        ),
      },
    }));

    addLog(
      'Chuyển tiền về quê báo hiếu bố mẹ',
      `Đã gửi ${formatVND(amount)} về ${player.hometown}. Trừ ${formatVND(
        debtReduced
      )} nợ Sổ Đỏ quê nhà · Tinh thần +8, Uy tín +2.`,
      'positive'
    );
  };

  const handleCallParents = () => {
    if (player.energy < 10) {
      sound.playWarning();
      return;
    }
    sound.playClick();
    setPlayer((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 10),
      sanity: Math.min(100, prev.sanity + 12),
      reputation: Math.min(100, prev.reputation + 2),
    }));
    addLog(
      'Gọi điện về quê hỏi thăm bố mẹ',
      'Nghe giọng mẹ báo tin sức khỏe bố tiến triển tốt, lòng bạn ấm lại và có thêm động lực phấn đấu (+12 Tinh thần, +2 Uy tín).',
      'positive'
    );
  };

  const handleAddCustomDiaryEntry = (
    title: string,
    detail: string,
    mood: string
  ) => {
    sound.playClick();
    setPlayer((prev) => ({
      ...prev,
      sanity: Math.min(100, prev.sanity + 8),
    }));
    addLog(title, detail, 'diary', player.day, {
      isUserWritten: true,
      mood,
    });
  };

  const handleDeleteDiaryEntry = (id: string) => {
    sound.playClick();
    setJournal((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDateCandidate = (
    candidate: WifeCandidate,
    mode: 'CAFE' | 'JEWELRY'
  ) => {
    const cost = mode === 'CAFE' ? 150_000 : 1_500_000;
    const affectionGain = mode === 'CAFE' ? 12 : 28;
    const sanityGain = mode === 'CAFE' ? 14 : 25;

    if (player.cash < cost) {
      sound.playWarning();
      return;
    }
    sound.playCoin();
    setPlayer((prev) => {
      const curAff = prev.family.affectionMap[candidate.id] || 0;
      const nextAff = Math.min(100, curAff + affectionGain);
      return {
        ...prev,
        cash: prev.cash - cost,
        sanity: Math.min(100, prev.sanity + sanityGain),
        story: {
          ...prev.story,
          maiAnhAffection:
            candidate.id === 'mai_anh' ? nextAff : prev.story.maiAnhAffection,
        },
        family: {
          ...prev.family,
          affectionMap: {
            ...prev.family.affectionMap,
            [candidate.id]: nextAff,
          },
        },
      };
    });
    addLog(
      mode === 'CAFE'
        ? `Hẹn hò tâm sự cùng ${candidate.name}`
        : `Tặng trang sức & hẹn hò lãng mạn với ${candidate.name}`,
      `Độ thiện cảm của ${candidate.name} +${affectionGain} · Tinh thần +${sanityGain}.`,
      'positive'
    );
  };

  const handleMarryCandidate = (candidate: WifeCandidate) => {
    if (
      player.family.marriedWifeId ||
      player.cash < candidate.weddingCost ||
      player.reputation < candidate.minReputation
    ) {
      sound.playWarning();
      return;
    }
    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - candidate.weddingCost,
      sanity: 100,
      reputation: Math.min(100, prev.reputation + 15),
      family: {
        ...prev.family,
        marriedWifeId: candidate.id,
        weddingDay: prev.day,
        maritalHappiness: 95,
      },
    }));
    addLog(
      `Lễ Cưới Trọng Đại Cùng ${candidate.name}!`,
      `Chính thức nên duyên vợ chồng với ${candidate.name}. Từ nay mỗi ngày vợ phụ giúp +${formatVND(
        candidate.dailyIncomeHelp
      )}/ngày và Tinh thần +${candidate.dailySanityBonus}/ngày!`,
      'positive'
    );
  };

  const handleHaveBaby = (babyName: string, gender: 'Trai' | 'Gái') => {
    const birthCost = 5_000_000;
    if (
      !player.family.marriedWifeId ||
      player.cash < birthCost ||
      player.family.children.length >= 3
    ) {
      sound.playWarning();
      return;
    }
    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - birthCost,
      sanity: 100,
      reputation: Math.min(100, prev.reputation + 8),
      family: {
        ...prev.family,
        maritalHappiness: Math.min(100, prev.family.maritalHappiness + 12),
        children: [
          ...prev.family.children,
          {
            id: `baby-${Date.now()}`,
            name: babyName,
            gender,
            birthDay: prev.day,
            ageStage: 'Sơ Sinh',
            smartPoints: 15,
            happiness: 100,
          },
        ],
      },
    }));
    addLog(
      `Đón thiên thần nhỏ chào đời: Bé ${babyName} (${gender})!`,
      `Cả gia đình vỡ òa hạnh phúc tại bệnh viện phụ sản (+12 Hạnh phúc gia đình, +8 Uy tín).`,
      'positive'
    );
  };

  const handleCareForFamily = (mode: 'MILK_SCHOOL' | 'FAMILY_TRIP') => {
    const cost = mode === 'MILK_SCHOOL' ? 500_000 : 3_000_000;
    if (player.cash < cost) {
      sound.playWarning();
      return;
    }
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      sanity: Math.min(100, prev.sanity + (mode === 'MILK_SCHOOL' ? 12 : 30)),
      family: {
        ...prev.family,
        maritalHappiness: Math.min(
          100,
          prev.family.maritalHappiness + (mode === 'MILK_SCHOOL' ? 10 : 25)
        ),
      },
    }));
    addLog(
      mode === 'MILK_SCHOOL'
        ? 'Mua sữa bỉm & đóng học phí cho con'
        : 'Đưa vợ con đi nghỉ dưỡng cuối tuần',
      `Tổ ấm ngập tràn tiếng cười, vợ con thêm yêu thương và tự hào về bạn.`,
      'positive'
    );
  };

  const handleTriggerLifeBranchDecision = (
    branchAction:
      | 'DESPAIR_BRIDGE_SUICIDE'
      | 'FLEE_DEBT_EXILE'
      | 'RISKY_CRIME_FOR_DEBT'
      | 'KNEEL_BEG_MERCY'
      | 'PEACEFUL_FAMILY_ENDING'
      | 'UNDERWORLD_KINGPIN_ENDING'
  ) => {
    if (branchAction === 'DESPAIR_BRIDGE_SUICIDE') {
      sound.playLose();
      unlockEndingById('ket_bi_kich_cau_long_bien');
      setPlayer((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          activeEndingId: 'ket_bi_kich_cau_long_bien',
        },
      }));
      setScreenState('GAME_OVER');
      return;
    }

    if (branchAction === 'FLEE_DEBT_EXILE') {
      sound.playLose();
      unlockEndingById('ket_tron_no_tha_huong');
      setPlayer((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          activeEndingId: 'ket_tron_no_tha_huong',
        },
      }));
      setScreenState('GAME_OVER');
      return;
    }

    if (branchAction === 'RISKY_CRIME_FOR_DEBT') {
      const success = Math.random() < 0.35;
      if (success) {
        sound.playCoin();
        setPlayer((prev) => ({
          ...prev,
          cash: prev.cash + 25_000_000,
          reputation: Math.max(0, prev.reputation - 20),
          story: {
            ...prev.story,
            underworldRespect: Math.min(100, prev.story.underworldRespect + 15),
          },
        }));
        addLog(
          'Phi vụ vận chuyển hàng cấm trót lọt trong đêm!',
          'Nhận nóng +25.000.000 ₫ tiền mặt để trả nợ, nhưng lương tâm cắn rứt (-20 Uy tín).',
          'danger'
        );
      } else {
        sound.playLose();
        unlockEndingById('ket_vong_lao_ly');
        setPlayer((prev) => ({
          ...prev,
          story: {
            ...prev.story,
            activeEndingId: 'ket_vong_lao_ly',
          },
        }));
        setScreenState('GAME_OVER');
      }
      return;
    }

    if (branchAction === 'KNEEL_BEG_MERCY') {
      sound.playWarning();
      setPlayer((prev) => ({
        ...prev,
        health: Math.max(15, prev.health - 20),
        reputation: Math.max(0, prev.reputation - 15),
        sanity: Math.min(100, prev.sanity + 20),
        sharkLoans: prev.sharkLoans.map((l) => ({
          ...l,
          dueDay: l.dueDay + 5,
          overdueDays: 0,
        })),
      }));
      addLog(
        'Cắn răng chịu nhục xin khất nợ Bát Họ',
        'Đàn em chủ nợ đồng ý cho thêm 5 ngày xoay tiền (-20 Sức khỏe, -15 Uy tín, +20 Tinh thần).',
        'danger'
      );
      return;
    }

    if (branchAction === 'PEACEFUL_FAMILY_ENDING') {
      sound.playWin();
      const endId =
        netWorth >= 500_000_000
          ? 'ket_vien_man_dai_gia'
          : 'ket_binh_yen_gia_dinh';
      unlockEndingById(endId);
      setPlayer((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          activeEndingId: endId,
          endingTitle:
            endId === 'ket_vien_man_dai_gia'
              ? 'Đại Gia Lập Nghiệp — Vinh Quy Bái Tổ'
              : 'Hạnh Phúc Bình Dị Bên Vợ Hiền Con Ngoan',
        },
      }));
      setScreenState('VICTORY');
      return;
    }

    if (branchAction === 'UNDERWORLD_KINGPIN_ENDING') {
      sound.playWin();
      unlockEndingById('ket_ong_trum_pho_thi');
      setPlayer((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          activeEndingId: 'ket_ong_trum_pho_thi',
          endingTitle: 'Ông Trùm Thế Giới Ngầm Phố Thị',
        },
      }));
      setScreenState('VICTORY');
    }
  };

  // ==================== THĂNG CHỨC, ĐÀO TẠO, ĐẦU TƯ & CẮM SỔ ĐỎ ====================
  const handleTakeTrainingCourse = (course: TrainingCourse) => {
    if (
      player.completedCourseIds.includes(course.id) ||
      player.cash < course.cost ||
      player.energy < course.energyCost
    ) {
      sound.playWarning();
      return;
    }
    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - course.cost,
      energy: Math.max(0, prev.energy - course.energyCost),
      workExp: prev.workExp + course.expBonus,
      reputation: Math.min(100, prev.reputation + course.reputationBonus),
      completedCourseIds: [...prev.completedCourseIds, course.id],
    }));
    addLog(
      `Tốt nghiệp khóa đào tạo: ${course.name}`,
      `Nhận chứng chỉ từ ${course.institution} (+${course.expBonus} EXP, +${course.reputationBonus} Uy tín).`,
      'positive'
    );
  };

  const handleApplyPromotion = () => {
    const nextRank = CAREER_RANKS_DATA.find(
      (r) => r.rankIndex === player.careerRankIndex + 1
    );
    if (!nextRank) return;
    const hasReqCourse =
      !nextRank.reqCourseId ||
      player.completedCourseIds.includes(nextRank.reqCourseId);
    if (
      player.workExp < nextRank.minExp ||
      player.reputation < nextRank.minReputation ||
      !hasReqCourse
    ) {
      sound.playWarning();
      return;
    }
    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      careerRankIndex: nextRank.rankIndex,
      reputation: Math.min(100, prev.reputation + 8),
      sanity: Math.min(100, prev.sanity + 15),
    }));
    addLog(
      `Thăng chức chính thức: ${nextRank.title}!`,
      `Hệ số thu nhập tăng lên x${nextRank.payMultiplier.toFixed(
        2
      )} và nhận lương cứng +${formatVND(nextRank.dailyBaseSalary)}/ngày!`,
      'positive'
    );
  };

  const handleBuyInvestment = (channel: InvestmentChannel, units: number) => {
    const curPrice = player.marketPrices[channel.id] || channel.baseUnitPrice;
    const totalCost = curPrice * units;
    if (units <= 0 || player.cash < totalCost) {
      sound.playWarning();
      return;
    }
    sound.playCoin();
    setPlayer((prev) => {
      const existing = prev.portfolio.find((p) => p.channelId === channel.id);
      let nextPortfolio;
      if (existing) {
        const nextUnits = existing.units + units;
        const nextAvg = Math.round(
          (existing.avgBuyPrice * existing.units + totalCost) / nextUnits
        );
        nextPortfolio = prev.portfolio.map((p) =>
          p.channelId === channel.id
            ? { ...p, units: nextUnits, avgBuyPrice: nextAvg }
            : p
        );
      } else {
        nextPortfolio = [
          ...prev.portfolio,
          { channelId: channel.id, units, avgBuyPrice: curPrice },
        ];
      }
      return {
        ...prev,
        cash: prev.cash - totalCost,
        portfolio: nextPortfolio,
      };
    });
    addLog(
      `Khớp lệnh mua ${units} lô ${channel.name} (${channel.code})`,
      `Tổng giá trị giải ngân: ${formatVND(totalCost)} (Giá khớp: ${formatVND(
        curPrice
      )}/lô).`,
      'info'
    );
  };

  const handleSellInvestment = (channel: InvestmentChannel, units: number) => {
    const holding = player.portfolio.find((p) => p.channelId === channel.id);
    if (!holding || holding.units < units || units <= 0) {
      sound.playWarning();
      return;
    }
    const curPrice = player.marketPrices[channel.id] || channel.baseUnitPrice;
    const totalProceeds = curPrice * units;
    const profit = (curPrice - holding.avgBuyPrice) * units;

    sound.playCoin();
    setPlayer((prev) => {
      const remaining = holding.units - units;
      const nextPortfolio =
        remaining > 0
          ? prev.portfolio.map((p) =>
              p.channelId === channel.id ? { ...p, units: remaining } : p
            )
          : prev.portfolio.filter((p) => p.channelId !== channel.id);
      return {
        ...prev,
        cash: prev.cash + totalProceeds,
        portfolio: nextPortfolio,
      };
    });
    addLog(
      `Chốt lời/Bán ${units} lô ${channel.name} (${channel.code})`,
      `Thu về +${formatVND(totalProceeds)} tiền mặt (${
        profit >= 0
          ? `Lãi ròng +${formatVND(profit)}`
          : `Lỗ ${formatVND(profit)}`
      }).`,
      profit >= 0 ? 'positive' : 'info'
    );
  };

  const handleMortgageRedBook = (
    mode: 'BANK_MORTGAGE_40M' | 'PAWNSHOP_HOT_60M' | 'VIP_SHARK_120M'
  ) => {
    if (mode === 'BANK_MORTGAGE_40M') {
      if (player.reputation < 45) {
        sound.playWarning();
        return;
      }
      sound.playCoin();
      setPlayer((prev) => ({
        ...prev,
        cash: prev.cash + 40_000_000,
        bankDebt: prev.bankDebt + 40_000_000,
        bankDebtDueDay: prev.day + 15,
      }));
      addLog(
        'Thế chấp Sổ Đỏ tại Ngân hàng giải ngân 40 Triệu',
        'Nhận +40.000.000 ₫ tiền mặt vào ví, dư nợ ngân hàng tăng thêm 40.000.000 ₫.',
        'info'
      );
      return;
    }

    if (mode === 'PAWNSHOP_HOT_60M') {
      sound.playCoin();
      setPlayer((prev) => ({
        ...prev,
        cash: prev.cash + 60_000_000,
        sanity: Math.max(0, prev.sanity - 15),
        story: {
          ...prev.story,
          familyDebtRemaining: prev.story.familyDebtRemaining + 75_000_000,
        },
      }));
      addLog(
        'Cắm nóng Sổ Đỏ quê nhà tại Tiệm Cầm Đồ lấy 60 Triệu!',
        'Nhận nóng +60.000.000 ₫ tiền mặt nhưng dư nợ Sổ Đỏ quê nhà đội thêm 75.000.000 ₫ (-15 Tinh thần).',
        'danger'
      );
      return;
    }

    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + 120_000_000,
      sanity: Math.max(0, prev.sanity - 25),
      reputation: Math.max(0, prev.reputation - 10),
      story: {
        ...prev.story,
        familyDebtRemaining: prev.story.familyDebtRemaining + 160_000_000,
      },
    }));
    addLog(
      'Liều lĩnh cắm đứt Sổ Đỏ đất tổ cho Lão Hạc lấy 120 Triệu!',
      'Giải ngân nóng +120.000.000 ₫ tiền mặt, nợ Sổ Đỏ quê nhà tăng thêm 160.000.000 ₫ (-25 Tinh thần, -10 Uy tín).',
      'danger'
    );
  };

  const handleRedeemHomeRedBook = (amount: number) => {
    handleSendMoneyHome(amount);
  };

  const handleInteractUnderworld = (
    mode: 'BEER_INTEL' | 'HIGH_STAKES_DUEL'
  ) => {
    if (mode === 'BEER_INTEL') {
      if (player.cash < 200_000) return;
      sound.playClick();
      setPlayer((prev) => ({
        ...prev,
        cash: prev.cash - 200_000,
        story: {
          ...prev.story,
          underworldRespect: Math.min(
            100,
            prev.story.underworldRespect + 12
          ),
        },
      }));
      addLog(
        'Mời bia Hùng "Bến Cảng"',
        'Nắm được thêm thông tin về sới bạc của Lão Hạc (+12 Độ nể giang hồ).',
        'info'
      );
      return;
    }

    // HIGH_STAKES_DUEL: Đấu bài cắt nợ quê
    if (player.cash < 2_000_000 || player.energy < 20) return;
    const winChance =
      0.48 + Math.min(0.32, player.story.underworldRespect * 0.004);
    const won = Math.random() < winChance;

    if (won) {
      sound.playWin();
      setPlayer((prev) => ({
        ...prev,
        cash: prev.cash + 2_000_000,
        energy: Math.max(0, prev.energy - 20),
        story: {
          ...prev.story,
          underworldRespect: Math.min(100, prev.story.underworldRespect + 10),
          familyDebtRemaining: Math.max(
            0,
            prev.story.familyDebtRemaining - 3_000_000
          ),
        },
      }));
      addLog(
        'Thắng kèo đấu bài sinh tử với đàn em Lão Hạc!',
        'Ăn tươi +2.000.000 ₫ tiền mặt và ép chúng gạch bớt 3.000.000 ₫ nợ quê nhà!',
        'positive'
      );
    } else {
      sound.playLose();
      setPlayer((prev) => ({
        ...prev,
        cash: Math.max(0, prev.cash - 2_000_000),
        energy: Math.max(0, prev.energy - 20),
        story: {
          ...prev.story,
          underworldRespect: Math.min(100, prev.story.underworldRespect + 4),
        },
      }));
      addLog(
        'Thua kèo đấu bài với đàn em Lão Hạc',
        'Mất 2.000.000 ₫ tiền cược nhưng tích lũy thêm kinh nghiệm trường đời (+4 Độ nể giang hồ).',
        'negative'
      );
    }
  };

  const handleCompleteChapterChoice = (
    chapterNumber: number,
    choice: StoryChoiceOption
  ) => {
    sound.playWin();
    const isFinalChapter = chapterNumber === 5;
    const nextChapter = chapterNumber + 1;

    setPlayer((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash + choice.cashDelta),
      reputation: Math.min(
        100,
        Math.max(0, prev.reputation + choice.reputationDelta)
      ),
      sanity: Math.min(100, Math.max(0, prev.sanity + choice.sanityDelta)),
      story: {
        ...prev.story,
        currentChapter: nextChapter,
        completedChapters: [...prev.story.completedChapters, chapterNumber],
        karmaPath: choice.karmaType,
        maiAnhAffection: Math.min(
          100,
          Math.max(0, prev.story.maiAnhAffection + choice.maiAnhDelta)
        ),
        underworldRespect: Math.min(
          100,
          Math.max(0, prev.story.underworldRespect + choice.underworldDelta)
        ),
        familyDebtRemaining: Math.max(
          0,
          prev.story.familyDebtRemaining - choice.familyDebtReduction
        ),
        endingTitle: isFinalChapter ? choice.label : prev.story.endingTitle,
      },
    }));

    const chObj = STORY_CHAPTERS_DATA.find(
      (c) => c.chapterNumber === chapterNumber
    );

    addLog(
      `Hoàn thành ${chObj?.title || `Chương ${chapterNumber}`}`,
      choice.outcomeText,
      'positive'
    );

    if (isFinalChapter) {
      setScreenState('VICTORY');
    } else {
      setStoryCutsceneModal({
        chapterTitle: chObj?.title || `Chương ${chapterNumber}`,
        outcomeText: choice.outcomeText,
        nextChapterNumber: nextChapter,
      });
    }
  };

  // ==================== HÀNH ĐỘNG LÀM VIỆC & ẨM THỰC ====================
  const handleDoJob = (job: JobOption) => {
    if (player.energy < job.energyCost) {
      sound.playWarning();
      addLog(
        'Kiệt sức không thể làm việc',
        `Bạn cần ${job.energyCost} Thể lực để làm "${job.title}". Hãy ghé quán phở, bánh mì vỉa hè hoặc qua ngày mới để nghỉ ngơi!`,
        'negative'
      );
      return;
    }

    if (job.reqAssetId) {
      const hasUsableAsset = player.assets.some(
        (a) => a.assetId === job.reqAssetId && !a.isPawned
      );
      if (!hasUsableAsset) {
        sound.playWarning();
        const reqItem = ASSETS_DATA.find((a) => a.id === job.reqAssetId);
        addLog(
          'Thiếu phương tiện hành nghề',
          `Công việc "${job.title}" yêu cầu sở hữu ${reqItem?.name || 'phương tiện'} (không bị cầm cố).`,
          'negative'
        );
        return;
      }
    }

    if (job.reqReputation && player.reputation < job.reqReputation) {
      sound.playWarning();
      addLog(
        'Chưa đủ Uy tín nghề nghiệp',
        `Bạn cần đạt tối thiểu ${job.reqReputation} điểm Uy tín xã hội để nhận việc "${job.title}".`,
        'negative'
      );
      return;
    }

    const expBonusMultiplier =
      1 + Math.min(0.6, Math.floor(player.workExp / 100) * 0.08);
    const actualPay = Math.round(job.basePay * expBonusMultiplier);

    sound.playCoin();

    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + actualPay,
      energy: Math.max(0, prev.energy - job.energyCost),
      sanity: Math.max(0, prev.sanity - job.stressCost),
      workExp: prev.workExp + job.expGain,
      reputation: Math.min(100, prev.reputation + 1),
      stats: {
        ...prev.stats,
        totalEarnedWork: prev.stats.totalEarnedWork + actualPay,
      },
    }));

    addLog(
      `Hoàn thành ca: ${job.title}`,
      `Nhận lương tươi +${formatVND(actualPay)} · Tiêu hao ${job.energyCost} Thể lực · Kinh nghiệm +${job.expGain}`,
      'positive'
    );

    if (Math.random() < 0.2 && !activeRandomEvent) {
      const randomEvt =
        RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setActiveRandomEvent(randomEvt);
    }
  };

  const handleBuyFoodOrService = (item: FoodOrServiceItem) => {
    if (player.cash < item.cost) {
      sound.playWarning();
      addLog(
        'Không đủ tiền mặt',
        `Bạn cần ${formatVND(item.cost)} để thưởng thức ${item.name}.`,
        'negative'
      );
      return;
    }

    sound.playClick();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - item.cost,
      energy: Math.min(
        prev.maxEnergy,
        Math.max(0, prev.energy + item.energyRestore)
      ),
      health: Math.min(
        prev.maxHealth,
        Math.max(1, prev.health + item.healthRestore)
      ),
      sanity: Math.min(100, Math.max(0, prev.sanity + item.sanityRestore)),
    }));

    addLog(
      `Ghé ${item.spot}: ${item.name}`,
      `Chi ${formatVND(item.cost)} · Thể lực +${item.energyRestore} · Tinh thần +${item.sanityRestore}`,
      'positive'
    );
  };

  // ==================== QUA NGÀY MỚI (SLEEP & DAILY SETTLEMENT) ====================
  const handleNextDay = () => {
    sound.playClick();
    const nextDay = player.day + 1;
    const nextAge = player.age + (nextDay % 30 === 0 ? 1 : 0);

    const currentHousing =
      HOUSING_DATA.find((h) => h.id === player.housingId) || HOUSING_DATA[0];
    const ownsCurrentHousing = player.ownedHousingIds.includes(
      currentHousing.id
    );
    const dailyRentCost = ownsCurrentHousing ? 0 : currentHousing.dailyRent;

    // Thu nhập thụ động từ tài sản + trợ giúp từ Mai Anh nếu thân thiết >= 50
    const assetsPassive = player.assets.reduce((acc, owned) => {
      if (owned.isPawned) return acc;
      const item = ASSETS_DATA.find((a) => a.id === owned.assetId);
      return acc + (item ? item.dailyPassiveIncome : 0);
    }, 0);

    const maiAnhBonus = player.story.maiAnhAffection >= 50 ? 150_000 : 0;
    const passiveIncome = assetsPassive + maiAnhBonus;

    const savingsInterest = Math.round(player.bankSavings * 0.006);
    const bankInterest = Math.round(player.bankDebt * 0.012);

    let sharkPenaltyHealth = 0;
    let sharkPenaltySanity = 0;
    let sharkPenaltyRep = 0;
    const sharkAlertMessages: string[] = [];

    const updatedSharkLoans = player.sharkLoans.map((loan) => {
      const dailySharkInt = Math.round(loan.principal * loan.dailyInterestRate);
      const isOverdue = nextDay > loan.dueDay;
      if (isOverdue) {
        sharkPenaltyHealth += 16;
        sharkPenaltySanity += 18;
        sharkPenaltyRep += 8;
        sharkAlertMessages.push(
          `Đàn em của "${loan.lenderName}" kéo tới phòng trọ tạt sơn mắm tôm và hành hung vì trễ bát họ "${loan.name}"!`
        );
      }
      return {
        ...loan,
        accruedInterest: loan.accruedInterest + dailySharkInt,
        overdueDays: isOverdue ? loan.overdueDays + 1 : 0,
      };
    });

    const nextCash = player.cash + passiveIncome - dailyRentCost;
    const nextHealth = Math.max(0, player.health - sharkPenaltyHealth);
    const nextSanity = Math.min(
      100,
      Math.max(
        0,
        player.sanity + currentHousing.dailySanityBonus - sharkPenaltySanity
      )
    );
    const nextEnergy = Math.min(
      player.maxEnergy,
      Math.round((currentHousing.dailyEnergyBonus / 100) * player.maxEnergy)
    );
    const nextRep = Math.max(
      0,
      Math.min(100, player.reputation - sharkPenaltyRep)
    );

    setPlayer((prev) => ({
      ...prev,
      day: nextDay,
      age: nextAge,
      cash: nextCash,
      bankSavings: prev.bankSavings + savingsInterest,
      bankDebt: prev.bankDebt + bankInterest,
      sharkLoans: updatedSharkLoans,
      health: nextHealth,
      sanity: nextSanity,
      energy: nextEnergy,
      reputation: nextRep,
    }));

    if (nextHealth <= 0) {
      sound.playLose();
      setScreenState('GAME_OVER');
      return;
    }

    if (sharkAlertMessages.length > 0) {
      sound.playWarning();
      addLog(
        `Ngày ${nextDay}: Bị Giang Hồ Đòi Nợ Thuê Khủng Bố!`,
        `${sharkAlertMessages[0]} (Mất ${sharkPenaltyHealth} Máu, ${sharkPenaltySanity} Tinh thần)`,
        'danger',
        nextDay
      );
    } else {
      const summaryParts: string[] = [];
      if (dailyRentCost > 0)
        summaryParts.push(`Tiền nhà -${formatCompactVND(dailyRentCost)}`);
      if (passiveIncome > 0)
        summaryParts.push(`Thu nhập phụ +${formatCompactVND(passiveIncome)}`);
      if (savingsInterest > 0)
        summaryParts.push(
          `Lãi tiết kiệm +${formatCompactVND(savingsInterest)}`
        );
      addLog(
        `Bình minh Ngày ${nextDay} tại ${currentHousing.name}`,
        summaryParts.join(' · ') ||
          'Đã nghỉ ngơi hồi phục thể lực sẵn sàng cho ngày mới.',
        'info',
        nextDay
      );
    }
  };

  // ==================== NHÀ Ở & MUA SẮM TÀI SẢN ====================
  const handleRentHousing = (tier: HousingTier) => {
    if (player.housingId === tier.id) return;
    if (player.cash < tier.dailyRent * 3) {
      sound.playWarning();
      addLog(
        'Không đủ tiền cọc thuê nhà',
        `Cần tối thiểu 3 ngày tiền nhà (${formatVND(tier.dailyRent * 3)}) trong túi để chuyển sang ${tier.name}.`,
        'negative'
      );
      return;
    }
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      housingId: tier.id,
      reputation: Math.min(100, prev.reputation + 4),
    }));
    addLog(
      `Chuyển chỗ ở mới: ${tier.name}`,
      `Mức thuê ${formatVND(tier.dailyRent)}/ngày · Hồi phục ${tier.dailyEnergyBonus}% Thể lực mỗi sáng.`,
      'positive'
    );
  };

  const handleBuyHousingPermanent = (tier: HousingTier) => {
    if (!tier.purchasePrice) return;
    if (player.cash < tier.purchasePrice) {
      sound.playWarning();
      return;
    }
    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - tier.purchasePrice!,
      housingId: tier.id,
      ownedHousingIds: [...prev.ownedHousingIds, tier.id],
      reputation: Math.min(100, prev.reputation + tier.reputationBonus),
    }));
    addLog(
      `Sở hữu vĩnh viễn Sổ Hồng: ${tier.name}!`,
      `Đã thanh toán ${formatVND(tier.purchasePrice)}. Từ nay miễn phí tiền thuê nhà trọn đời!`,
      'positive'
    );
  };

  const handleBuyAsset = (item: AssetItem) => {
    if (player.assets.some((a) => a.assetId === item.id)) return;
    if (player.cash < item.price) {
      sound.playWarning();
      addLog(
        'Chưa đủ tiền tậu tài sản',
        `Bạn cần ${formatVND(item.price)} tiền mặt để mua ${item.name}.`,
        'negative'
      );
      return;
    }
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - item.price,
      assets: [...prev.assets, { assetId: item.id, isPawned: false }],
      reputation: Math.min(100, prev.reputation + item.reputationBonus),
    }));
    addLog(
      `Tậu tài sản mới: ${item.name}`,
      `Thanh toán ${formatVND(item.price)} · Uy tín +${item.reputationBonus}${
        item.dailyPassiveIncome > 0
          ? ` · Dòng tiền thụ động +${formatVND(item.dailyPassiveIncome)}/ngày`
          : ''
      }`,
      'positive'
    );
  };

  // ==================== NGÂN HÀNG & BỐC BÁT HỌ HANDLERS ====================
  const handleDepositBank = (amount: number) => {
    if (amount <= 0 || player.cash < amount) return;
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - amount,
      bankSavings: prev.bankSavings + amount,
    }));
    addLog(
      'Gửi tiết kiệm Ngân hàng VietBank',
      `Đã nạp +${formatVND(amount)} vào sổ tiết kiệm hưởng lãi 0.6%/ngày.`,
      'positive'
    );
  };

  const handleWithdrawBank = (amount: number) => {
    if (amount <= 0 || player.bankSavings < amount) return;
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      bankSavings: prev.bankSavings - amount,
    }));
    addLog(
      'Rút sổ tiết kiệm VietBank',
      `Đã rút +${formatVND(amount)} tiền mặt về ví.`,
      'info'
    );
  };

  const handleBorrowBank = (amount: number) => {
    if (amount <= 0) return;
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      bankDebt: prev.bankDebt + amount,
      bankDebtDueDay: prev.day + 14,
    }));
    addLog(
      'Giải ngân khoản vay Ngân hàng VietBank',
      `Nhận +${formatVND(amount)} tiền mặt với lãi suất ưu đãi 1.2%/ngày.`,
      'info'
    );
  };

  const handleRepayBank = (amount: number) => {
    if (amount <= 0 || player.cash < amount) return;
    sound.playCoin();
    setPlayer((prev) => {
      const nextDebt = Math.max(0, prev.bankDebt - amount);
      return {
        ...prev,
        cash: prev.cash - amount,
        bankDebt: nextDebt,
        bankDebtDueDay: nextDebt === 0 ? null : prev.bankDebtDueDay,
        reputation: Math.min(100, prev.reputation + 3),
      };
    });
    addLog(
      'Thanh toán nợ Ngân hàng VietBank',
      `Đã trả ${formatVND(amount)} nợ ngân hàng · Điểm tín dụng CIC +3.`,
      'positive'
    );
  };

  const handleTakeSharkLoan = (pkg: SharkLoanPackage) => {
    const netCash = Math.round(
      pkg.principal * (1 - pkg.upfrontCutPercent / 100)
    );
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + netCash,
      sharkLoans: [
        ...prev.sharkLoans,
        {
          packageId: pkg.id,
          name: pkg.name,
          lenderName: pkg.lenderName,
          principal: pkg.principal,
          accruedInterest: 0,
          dailyInterestRate: pkg.dailyInterestRate,
          borrowedDay: prev.day,
          dueDay: prev.day + pkg.durationDays,
          overdueDays: 0,
        },
      ],
    }));
    addLog(
      `Bốc Bát Họ: ${pkg.name}`,
      `Ký giấy nợ ${formatVND(pkg.principal)}, cắt lãi trước nhận về ${formatVND(netCash)}. Hạn trả: Ngày ${player.day + pkg.durationDays}.`,
      'danger'
    );
  };

  const handleRepaySharkLoan = (index: number) => {
    const target = player.sharkLoans[index];
    if (!target) return;
    const totalPayoff = target.principal + target.accruedInterest;
    if (player.cash < totalPayoff) return;

    sound.playWin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - totalPayoff,
      sharkLoans: prev.sharkLoans.filter((_, idx) => idx !== index),
      sanity: Math.min(100, prev.sanity + 15),
    }));
    addLog(
      `Tất toán xong Bát Họ: ${target.name}`,
      `Đã trả đứt gốc và lãi ${formatVND(totalPayoff)} cho ${target.lenderName}. Thoát cảnh nợ nần!`,
      'positive'
    );
  };

  const handleBegSharkExtension = (index: number) => {
    const target = player.sharkLoans[index];
    if (!target) return;
    const fee = Math.round(target.principal * 0.15);
    if (player.cash < fee) return;

    sound.playClick();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - fee,
      sharkLoans: prev.sharkLoans.map((l, idx) =>
        idx === index ? { ...l, dueDay: l.dueDay + 3, overdueDays: 0 } : l
      ),
    }));
    addLog(
      `Đóng phế xin khất nợ ${target.lenderName}`,
      `Chi ${formatVND(fee)} tiền trà nước cho đàn em để dời hạn trả bát họ thêm 3 ngày.`,
      'info'
    );
  };

  const handlePawnAsset = (assetId: string) => {
    const item = ASSETS_DATA.find((a) => a.id === assetId);
    if (!item) return;
    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash + item.pawnValue,
      assets: prev.assets.map((a) =>
        a.assetId === assetId
          ? { ...a, isPawned: true, pawnedDay: prev.day }
          : a
      ),
    }));
    addLog(
      `Cầm đồ: ${item.name}`,
      `Cắm ${item.name} tại tiệm Anh Long lấy ngay +${formatVND(item.pawnValue)} tiền mặt.`,
      'info'
    );
  };

  const handleRedeemAsset = (assetId: string) => {
    const item = ASSETS_DATA.find((a) => a.id === assetId);
    if (!item) return;
    const redeemCost = Math.round(item.pawnValue * 1.1);
    if (player.cash < redeemCost) return;

    sound.playCoin();
    setPlayer((prev) => ({
      ...prev,
      cash: prev.cash - redeemCost,
      assets: prev.assets.map((a) =>
        a.assetId === assetId
          ? { ...a, isPawned: false, pawnedDay: undefined }
          : a
      ),
    }));
    addLog(
      `Chuộc lại tài sản: ${item.name}`,
      `Thanh toán ${formatVND(redeemCost)} lấy lại ${item.name} về sử dụng.`,
      'positive'
    );
  };

  // ==================== CASINO CALLBACK ====================
  const handleCasinoResult = (
    cashDelta: number,
    sanityDelta: number,
    energyDelta: number,
    gameType: 'BACAY' | 'LIENG' | 'TAIXIU',
    logTitle: string,
    logDetail: string
  ) => {
    setPlayer((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash + cashDelta),
      sanity: Math.min(100, Math.max(0, prev.sanity + sanityDelta)),
      energy: Math.max(0, prev.energy + energyDelta),
      story: {
        ...prev.story,
        underworldRespect: Math.min(
          100,
          prev.story.underworldRespect + (cashDelta > 0 ? 2 : 1)
        ),
      },
      stats: {
        ...prev.stats,
        totalWonCasino:
          cashDelta > 0
            ? prev.stats.totalWonCasino + cashDelta
            : prev.stats.totalWonCasino,
        totalLostCasino:
          cashDelta < 0
            ? prev.stats.totalLostCasino + Math.abs(cashDelta)
            : prev.stats.totalLostCasino,
        baCayRounds:
          gameType === 'BACAY'
            ? prev.stats.baCayRounds + 1
            : prev.stats.baCayRounds,
        liengRounds:
          gameType === 'LIENG'
            ? prev.stats.liengRounds + 1
            : prev.stats.liengRounds,
        taiXiuRounds:
          gameType === 'TAIXIU'
            ? prev.stats.taiXiuRounds + 1
            : prev.stats.taiXiuRounds,
      },
    }));

    addLog(logTitle, logDetail, cashDelta >= 0 ? 'positive' : 'casino');
  };

  // ==================== RANDOM EVENT CHOICE ====================
  const handleChooseRandomEvent = (choiceIndex: number) => {
    if (!activeRandomEvent) return;
    const choice = activeRandomEvent.choices[choiceIndex];
    if (!choice) return;

    if (choice.cashDelta < 0 && player.cash < Math.abs(choice.cashDelta)) {
      sound.playWarning();
      addLog(
        'Không đủ tiền mặt cho lựa chọn này',
        `Bạn cần ${formatVND(Math.abs(choice.cashDelta))} tiền mặt.`,
        'negative'
      );
      return;
    }

    sound.playClick();
    setPlayer((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash + choice.cashDelta),
      health: Math.min(
        prev.maxHealth,
        Math.max(1, prev.health + choice.healthDelta)
      ),
      sanity: Math.min(100, Math.max(0, prev.sanity + choice.sanityDelta)),
      energy: Math.min(
        prev.maxEnergy,
        Math.max(0, prev.energy + choice.energyDelta)
      ),
      reputation: Math.min(
        100,
        Math.max(0, prev.reputation + choice.reputationDelta)
      ),
    }));

    addLog(
      activeRandomEvent.title,
      choice.outcomeText,
      choice.cashDelta >= 0 && choice.reputationDelta >= 0 ? 'positive' : 'info'
    );
    setActiveRandomEvent(null);
  };

  // ==================== TẠO NHÂN VẬT MỚI & CHƠI LẠI TỪ ĐẦU ====================
  const handleCreateNewCharacterAndRestart = () => {
    sound.playWin();
    const fresh = createInitialPlayer(
      customNameInput.trim() || 'Nguyễn Văn Nam',
      customHometownInput.trim() || 'Nam Định',
      selectedBgId,
      startingAgeInput,
      startingDebtOption
    );
    setPlayer(fresh);
    setJournal([
      {
        id: `init-${Date.now()}`,
        day: 1,
        title: `Khởi đầu cuộc đời mới: ${fresh.name} (${fresh.backgroundTitle})`,
        detail: `${fresh.name} (${fresh.age} tuổi, quê ${fresh.hometown}) bắt đầu hành trình với ${formatVND(fresh.cash)} tiền mặt và quyết tâm trả món nợ quê nhà ${formatVND(startingDebtOption)}.`,
        type: 'info',
      },
    ]);
    setScreenState('PLAYING');
    setActiveTab('STORY');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const currentHousingObj =
    HOUSING_DATA.find((h) => h.id === player.housingId) || HOUSING_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-[#F8FAFC]">
      {/* TOP BAR CONTRACT: Strictly 1 row, 3 zones */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 sticky top-0 z-30 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('STORY');
          }}
          className="text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Kiếp Nhân Sinh VN
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('STORY');
            }}
            className={`pb-0.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'STORY'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Cốt Truyện (Chương {Math.min(5, player.story.currentChapter)}/5)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('STREET');
            }}
            className={`pb-0.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'STREET'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Khu Phố & Việc Làm
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('HOME');
            }}
            className={`pb-0.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'HOME'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Phòng Trọ & Tài Sản
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('FINANCE');
            }}
            className={`pb-0.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'FINANCE'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Ngân Hàng & Bát Họ
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('CASINO');
            }}
            className={`pb-0.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'CASINO'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Tài Xỉu · 3 Cây · Liêng
          </button>
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNextDay}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Qua Ngày Mới (+1 Ngày)
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setScreenState('TITLE_MENU');
            }}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tạo Nhân Vật / Chơi Lại
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation Bar */}
      <div className="flex md:hidden items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-900 border-b border-slate-800">
        {[
          { id: 'STORY', label: `Cốt Truyện (Ch.${Math.min(5, player.story.currentChapter)})` },
          { id: 'STREET', label: 'Khu Phố' },
          { id: 'HOME', label: 'Nhà & Xe' },
          { id: 'FINANCE', label: 'Vay & Bát Họ' },
          { id: 'CASINO', label: 'Tài Xỉu · 3 Cây · Liêng' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as ActiveTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* UNOBTRUSIVE HUD STATUS BAR */}
      <section className="bg-slate-900/90 border-b border-slate-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Nhân vật & Thời gian */}
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="font-semibold text-white">{player.name}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">{player.backgroundTitle}</span>
            <span aria-hidden="true">·</span>
            <span>Quê {player.hometown}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-white font-semibold">
              Ngày {player.day} (Tuổi {player.age})
            </span>
          </div>

          {/* Chỉ số Tiền Mặt, Tiết Kiệm, Nợ Quê & Nợ Vay */}
          <div className="flex flex-wrap items-center gap-3.5 font-mono tabular-nums">
            <div>
              <span className="text-slate-400 mr-1">Tiền mặt:</span>
              <span className="text-emerald-400 font-bold text-sm">
                {formatVND(player.cash)}
              </span>
            </div>
            <span className="text-slate-700" aria-hidden="true">
              /
            </span>
            <div>
              <span className="text-slate-400 mr-1">Tiết kiệm:</span>
              <span className="text-sky-400 font-semibold">
                {formatCompactVND(player.bankSavings)}
              </span>
            </div>
            <span className="text-slate-700" aria-hidden="true">
              /
            </span>
            <div>
              <span className="text-slate-400 mr-1">Nợ quê:</span>
              <span className="text-amber-300 font-semibold">
                {formatCompactVND(player.story.familyDebtRemaining)}
              </span>
            </div>
            <span className="text-slate-700" aria-hidden="true">
              /
            </span>
            <div>
              <span className="text-slate-400 mr-1">Nợ NH & Bát Họ:</span>
              <span
                className={
                  player.bankDebt + totalSharkDebt > 0
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-300'
                }
              >
                {formatCompactVND(player.bankDebt + totalSharkDebt)}
              </span>
            </div>
          </div>

          {/* Chỉ số Sinh tồn */}
          <div className="flex flex-wrap items-center gap-3 font-mono tabular-nums">
            <span
              className={
                player.health < 35
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-200'
              }
            >
              Sức khỏe: {player.health}/{player.maxHealth}
            </span>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <span className="text-amber-300">
              Thể lực: {player.energy}/{player.maxEnergy}
            </span>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <span className="text-sky-300">Tinh thần: {player.sanity}/100</span>
            <span className="text-slate-700" aria-hidden="true">
              ·
            </span>
            <span className="text-emerald-300">
              Uy tín CIC: {player.reputation}/100
            </span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Thông báo sự kiện vừa diễn ra */}
        {toastBanner && (
          <div
            className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-4 text-xs ${
              toastBanner.tone === 'positive'
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-100'
                : toastBanner.tone === 'negative'
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-100'
                : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}
          >
            <div>
              <strong className="font-semibold mr-2">
                {toastBanner.title}:
              </strong>
              <span>{toastBanner.detail}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="text-slate-400 hover:text-white font-mono text-xs whitespace-nowrap cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* ==================== TAB 0: CỐT TRUYỆN & SỔ TAY ==================== */}
        {activeTab === 'STORY' && (
          <StoryCampaign
            player={player}
            netWorth={netWorth}
            journal={journal}
            unlockedEndings={unlockedEndings}
            soundEnabled={soundEnabled}
            realTimeClockStr={realTimeClockStr}
            realTimePeriodLabel={realTimePeriodLabel}
            realTimeSpeed={realTimeSpeed}
            onChangeRealTimeSpeed={setRealTimeSpeed}
            onAddCustomDiaryEntry={handleAddCustomDiaryEntry}
            onDeleteDiaryEntry={handleDeleteDiaryEntry}
            onToggleSound={toggleSound}
            onSendMoneyHome={handleSendMoneyHome}
            onCallParents={handleCallParents}
            onDateCandidate={handleDateCandidate}
            onMarryCandidate={handleMarryCandidate}
            onHaveBaby={handleHaveBaby}
            onCareForFamily={handleCareForFamily}
            onInteractUnderworld={handleInteractUnderworld}
            onTriggerLifeBranchDecision={handleTriggerLifeBranchDecision}
            onCompleteChapterChoice={handleCompleteChapterChoice}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenCharacterCreator={() => setScreenState('TITLE_MENU')}
          />
        )}

        {/* ==================== TAB 1: KHU PHỐ & VIỆC LÀM ==================== */}
        {activeTab === 'STREET' && (
          <div className="space-y-8">
            {/* Hero Cảnh Khu Phố Việt Nam */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
              <div className="aspect-[21/8] w-full relative overflow-hidden bg-slate-950">
                <img
                  src={streetSceneImg}
                  alt="Khung cảnh góc phố Việt Nam lúc hoàng hôn với quán trà đá vỉa hè, quán phở, xe máy và tiệm cầm đồ"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="max-w-2xl">
                    <p className="text-xs font-medium text-amber-300 mb-1">
                      Nhịp Sống Đô Thị Việt Nam · Ngày {player.day} · Chỗ ở hiện tại: {currentHousingObj.name}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                      Mưu Sinh Vỉa Hè, Lập Nghiệp Phố Thị
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">
                      Chăm chỉ cày cuốc tích lũy kinh nghiệm mở khóa nghề thu nhập tiền triệu, ghé quán phở hồi sức hoặc sang sới lắc Tài Xỉu thử vận may.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPreferredCasinoGame('TAIXIU');
                        setActiveTab('CASINO');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Đánh Tài Xỉu Xí Ngầu Ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('FINANCE');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Vay Ngân Hàng / Bốc Bát Họ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lộ Trình Thăng Tiến Sự Nghiệp & Đào Tạo Nghiệp Vụ */}
            <CareerPromotionPanel
              player={player}
              onTakeTrainingCourse={handleTakeTrainingCourse}
              onApplyPromotion={handleApplyPromotion}
            />

            {/* Danh sách Công Việc Mưu Sinh */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    01. Việc Làm & Nghề Tự Do Trong Khu Phố
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kinh nghiệm tích lũy:{' '}
                    <span className="font-mono text-amber-300">
                      {player.workExp} EXP
                    </span>{' '}
                    (Tăng +{Math.min(60, Math.floor(player.workExp / 100) * 8)}% thu nhập tất cả công việc)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {JOBS_DATA.map((job) => {
                  const expBonusMultiplier =
                    1 + Math.min(0.6, Math.floor(player.workExp / 100) * 0.08);
                  const actualPay = Math.round(
                    job.basePay * expBonusMultiplier
                  );
                  const reqAssetItem = job.reqAssetId
                    ? ASSETS_DATA.find((a) => a.id === job.reqAssetId)
                    : null;
                  const hasReqAsset =
                    !job.reqAssetId ||
                    player.assets.some(
                      (a) => a.assetId === job.reqAssetId && !a.isPawned
                    );
                  const hasReqRep =
                    !job.reqReputation ||
                    player.reputation >= job.reqReputation;

                  return (
                    <div
                      key={job.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="text-xs text-slate-400">
                          <span>{job.category}</span>
                          <span className="mx-1.5" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono text-amber-300">
                            -{job.energyCost} Thể lực
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {job.description}
                        </p>

                        {(reqAssetItem || job.reqReputation) && (
                          <div className="pt-1 text-xs text-slate-300">
                            Điều kiện:{' '}
                            {reqAssetItem && (
                              <span
                                className={
                                  hasReqAsset
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }
                              >
                                Cần {reqAssetItem.name}
                              </span>
                            )}
                            {reqAssetItem && job.reqReputation && ' · '}
                            {job.reqReputation && (
                              <span
                                className={
                                  hasReqRep
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }
                              >
                                Uy tín ≥ {job.reqReputation}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] text-slate-400">
                            Thu nhập/ca
                          </div>
                          <div className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                            +{formatVND(actualPay)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDoJob(job)}
                          disabled={
                            !hasReqAsset ||
                            !hasReqRep ||
                            player.energy < job.energyCost
                          }
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {!hasReqAsset
                            ? 'Thiếu Phương Tiện'
                            : !hasReqRep
                            ? 'Thiếu Uy Tín'
                            : player.energy < job.energyCost
                            ? 'Hết Thể Lực'
                            : 'Vào Ca Làm Việc'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ẩm Thực Đường Phố & Dịch Vụ Hồi Sức */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-bold text-white">
                  02. Ẩm Thực Vỉa Hè & Chăm Sóc Sức Khỏe
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Nạp lại thể lực để cày thêm ca hoặc giải tỏa căng thẳng sau những giờ lăn lộn ngoài đời.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STREET_FOOD_DATA.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="text-xs text-amber-300/90">
                        {item.spot}
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="pt-1 text-xs font-mono text-slate-300">
                        Thể lực +{item.energyRestore} · Tinh thần +{item.sanityRestore} · Sức khỏe{' '}
                        {item.healthRestore >= 0
                          ? `+${item.healthRestore}`
                          : item.healthRestore}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div className="text-sm font-mono font-bold text-white tabular-nums">
                        {formatVND(item.cost)}
                      </div>
                      <button
                        type="button"
                        disabled={player.cash < item.cost}
                        onClick={() => handleBuyFoodOrService(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Thưởng Thức Ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 2: PHÒNG TRỌ & TÀI SẢN ==================== */}
        {activeTab === 'HOME' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hình ảnh Phòng Trọ / Không Gian Sống */}
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={apartmentSceneImg}
                    alt="Không gian phòng trọ sinh viên và người lao động Việt Nam với quạt cây, bàn làm việc và mì tôm"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs font-medium text-amber-300">
                      Nơi Ăn Chốn Ở Hiện Tại
                    </div>
                    <h1 className="text-2xl font-display font-bold text-white mt-0.5">
                      {currentHousingObj.name}
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">
                      {currentHousingObj.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hồ Sơ Nhân Vật & Tổng Tài Sản Ròng */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarPortraitImg}
                    alt="Chân dung nhân vật chính"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border border-amber-400/50 shrink-0"
                  />
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">
                      {player.name}
                    </h2>
                    <p className="text-xs text-amber-300 font-medium">
                      {player.backgroundTitle}
                    </p>
                    <p className="text-xs text-slate-400">
                      Quê quán: {player.hometown} · Tuổi {player.age}
                    </p>
                    <p className="text-xs text-emerald-400 font-mono mt-1">
                      Tài sản ròng: {formatVND(netWorth)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Tổng kiếm từ lao động:
                    </span>
                    <span className="text-emerald-400 tabular-nums">
                      {formatVND(player.stats.totalEarnedWork)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Tổng thắng chiếu bạc:
                    </span>
                    <span className="text-amber-300 tabular-nums">
                      {formatVND(player.stats.totalWonCasino)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tổng thua chiếu bạc:</span>
                    <span className="text-rose-400 tabular-nums">
                      {formatVND(player.stats.totalLostCasino)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Số ván 3 Cây / Liêng / Tài Xỉu:
                    </span>
                    <span className="text-white tabular-nums">
                      {player.stats.baCayRounds} / {player.stats.liengRounds} /{' '}
                      {player.stats.taiXiuRounds}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ngủ Qua Ngày (+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenState('TITLE_MENU')}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Tạo Lại Nhân Vật
                  </button>
                </div>
              </div>
            </div>

            {/* Nâng cấp chỗ ở */}
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">
                01. Nâng Cấp Chỗ Ở & Bất Động Sản Để Ở
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HOUSING_DATA.map((tier) => {
                  const isCurrent = player.housingId === tier.id;
                  const isOwned = player.ownedHousingIds.includes(tier.id);
                  return (
                    <div
                      key={tier.id}
                      className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? 'bg-slate-900 border-amber-400/60'
                          : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-white">
                            {tier.name}
                          </h3>
                          <span className="text-xs font-mono text-amber-300">
                            {isOwned
                              ? 'Đã Mua Sở Hữu'
                              : `Thuê ${formatVND(tier.dailyRent)}/ngày`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {tier.description}
                        </p>
                        <div className="text-xs font-mono text-slate-300 pt-1">
                          Hồi phục sáng: {tier.dailyEnergyBonus}% Thể lực · Tinh thần{' '}
                          {tier.dailySanityBonus >= 0
                            ? `+${tier.dailySanityBonus}`
                            : tier.dailySanityBonus}
                          /ngày
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleRentHousing(tier)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {isCurrent ? 'Đang Ở Đây' : 'Chuyển Tới Thuê'}
                        </button>
                        {tier.purchasePrice && !isOwned && (
                          <button
                            type="button"
                            disabled={player.cash < tier.purchasePrice}
                            onClick={() => handleBuyHousingPermanent(tier)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Mua Đứt Sổ Hồng (
                            {formatCompactVND(tier.purchasePrice)})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Cửa Hàng Phương Tiện, Vàng SJC & Tài Sản Đầu Tư */}
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-display font-bold text-white">
                  02. Mua Sắm Xe Máy, Vàng SJC & Tài Sản Sinh Lời
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tài sản giúp mở khóa nghề lương cao, hoàn thành nhiệm vụ Cốt Truyện và tạo thu nhập thụ động mỗi ngày.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ASSETS_DATA.map((item) => {
                  const ownedRecord = player.assets.find(
                    (a) => a.assetId === item.id
                  );
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="text-xs text-slate-400">
                          <span>{item.category}</span>
                          <span className="mx-1.5">·</span>
                          <span className="text-emerald-400">
                            Uy tín +{item.reputationBonus}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                        {item.dailyPassiveIncome > 0 && (
                          <div className="text-xs font-mono text-amber-300 pt-1">
                            Dòng tiền thụ động: +
                            {formatVND(item.dailyPassiveIncome)}/ngày
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                        <div className="text-sm font-mono font-bold text-white tabular-nums">
                          {formatVND(item.price)}
                        </div>
                        {ownedRecord ? (
                          <span className="text-xs font-mono font-semibold text-emerald-400">
                            {ownedRecord.isPawned
                              ? 'Đã Mua (Đang Cầm Đồ)'
                              : 'Đã Sở Hữu'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={player.cash < item.price}
                            onClick={() => handleBuyAsset(item)}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Mua Ngay
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Sàn Giao Dịch Đầu Tư Thời Gian Thực */}
            <InvestmentExchangePanel
              player={player}
              onBuyInvestment={handleBuyInvestment}
              onSellInvestment={handleSellInvestment}
            />

            {/* Bàn Cắm Sổ Đỏ & Thế Chấp Đất Đai */}
            <RedBookMortgagePanel
              player={player}
              onMortgageRedBook={handleMortgageRedBook}
              onRedeemHomeRedBook={handleRedeemHomeRedBook}
            />
          </div>
        )}

        {/* ==================== TAB 3: NGÂN HÀNG & BÁT HỌ ==================== */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-8">
            <RedBookMortgagePanel
              player={player}
              onMortgageRedBook={handleMortgageRedBook}
              onRedeemHomeRedBook={handleRedeemHomeRedBook}
            />
            <FinanceCenter
              player={player}
              onDepositBank={handleDepositBank}
              onWithdrawBank={handleWithdrawBank}
              onBorrowBank={handleBorrowBank}
              onRepayBank={handleRepayBank}
              onTakeSharkLoan={handleTakeSharkLoan}
              onRepaySharkLoan={handleRepaySharkLoan}
              onBegSharkExtension={handleBegSharkExtension}
              onPawnAsset={handlePawnAsset}
              onRedeemAsset={handleRedeemAsset}
            />
            <InvestmentExchangePanel
              player={player}
              onBuyInvestment={handleBuyInvestment}
              onSellInvestment={handleSellInvestment}
            />
          </div>
        )}

        {/* ==================== TAB 4: CHIẾU BẠC ĐỎ ĐEN (TÀI XỈU, 3 CÂY, LIÊNG) ==================== */}
        {activeTab === 'CASINO' && (
          <CasinoArena
            cash={player.cash}
            energy={player.energy}
            initialGame={preferredCasinoGame}
            onUpdateCasinoResult={handleCasinoResult}
            onNavigateFinance={() => setActiveTab('FINANCE')}
          />
        )}
      </main>

      {/* MODAL CHUYỂN CHƯƠNG CỐT TRUYỆN */}
      {storyCutsceneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-amber-400/60 p-6 shadow-2xl space-y-5">
            <div>
              <div className="text-xs font-mono text-emerald-400">
                HOÀN THÀNH CHƯƠNG CỐT TRUYỆN
              </div>
              <h2 className="text-2xl font-display font-bold text-white mt-1">
                {storyCutsceneModal.chapterTitle}
              </h2>
              <p className="text-sm text-slate-200 mt-3 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                {storyCutsceneModal.outcomeText}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStoryCutsceneModal(null)}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm cursor-pointer"
            >
              Bước Sang Chương 0{storyCutsceneModal.nextChapterNumber} Tiếp Theo
            </button>
          </div>
        </div>
      )}

      {/* MODAL SỰ KIỆN ĐỜI THƯỜNG NGẪU NHIÊN */}
      {activeRandomEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-amber-400/50 p-6 shadow-2xl space-y-5">
            <div>
              <div className="text-xs font-medium text-amber-300">
                Tình Huống Đời Thường Bất Ngờ · Ngày {player.day}
              </div>
              <h2 className="text-xl font-display font-bold text-white mt-1">
                {activeRandomEvent.title}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {activeRandomEvent.description}
              </p>
            </div>

            <div className="space-y-2.5">
              {activeRandomEvent.choices.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChooseRandomEvent(idx)}
                  className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <div className="text-sm font-semibold text-amber-300">
                    {ch.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO NHÂN VẬT & CHƠI LẠI TỪ ĐẦU */}
      {screenState === 'TITLE_MENU' && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs text-amber-300 font-medium">
                  Khởi Tạo Cuộc Đời & Chọn Xuất Thân
                </div>
                <h2 className="text-2xl font-display font-bold text-white mt-0.5">
                  Tạo Nhân Vật Mới & Chơi Lại Từ Đầu
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tùy chỉnh họ tên, quê quán, độ tuổi, hoàn cảnh xuất thân và mức độ thử thách nợ gia đình trước khi bước vào phố thị.
                </p>
              </div>
              <img
                src={avatarPortraitImg}
                alt="Chân dung nhân vật"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-amber-400/50 shrink-0"
              />
            </div>

            {/* Họ tên, Tuổi & Quê quán */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-300">
                    Họ và tên nhân vật:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      const randomName =
                        SAMPLE_VN_NAMES[
                          Math.floor(Math.random() * SAMPLE_VN_NAMES.length)
                        ];
                      setCustomNameInput(randomName);
                    }}
                    className="text-[11px] text-amber-300 hover:underline cursor-pointer"
                  >
                    Đổi tên ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="Nhập họ tên..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Tuổi khởi đầu: <strong className="font-mono text-amber-300">{startingAgeInput} tuổi</strong>
                </label>
                <input
                  type="range"
                  min={18}
                  max={32}
                  value={startingAgeInput}
                  onChange={(e) => setStartingAgeInput(Number(e.target.value))}
                  className="w-full accent-amber-400 mt-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Chọn Quê Quán */}
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">
                Quê quán xuất thân:
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {HOMETOWN_PRESETS.map((town) => (
                  <button
                    key={town}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCustomHometownInput(town);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                      customHometownInput === town
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {town}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customHometownInput}
                onChange={(e) => setCustomHometownInput(e.target.value)}
                placeholder="Hoặc tự nhập tỉnh/thành phố quê bạn..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            {/* Chọn 1 trong 4 Hoàn Cảnh Xuất Thân */}
            <div className="space-y-2">
              <label className="block text-xs text-slate-300">
                Chọn Hoàn Cảnh Xuất Thân (Ảnh hưởng vốn khởi đầu & kỹ năng):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHARACTER_BACKGROUNDS.map((bg) => {
                  const isSelected = selectedBgId === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedBgId(bg.id);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-white">
                        {bg.title}
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                        {bg.tagline}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {bg.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Độ khó / Quy mô nợ Sổ Đỏ quê nhà */}
            <div className="space-y-1.5">
              <label className="block text-xs text-slate-300">
                Độ Khó Cốt Truyện (Số nợ Sổ Đỏ quê nhà cần chuộc lại):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Dễ Thở (80 Triệu)', val: 80_000_000 },
                  { label: 'Tiêu Chuẩn (150 Triệu)', val: 150_000_000 },
                  { label: 'Khốc Liệt (250 Triệu)', val: 250_000_000 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setStartingDebtOption(opt.val);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold cursor-pointer border ${
                      startingDebtOption === opt.val
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setScreenState('PLAYING')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Đóng & Tiếp Tục Màn Đang Chơi (Ngày {player.day})
              </button>
              <button
                type="button"
                onClick={handleCreateNewCharacterAndRestart}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
              >
                Xác Nhận Tạo Nhân Vật & Chơi Lại Từ Ngày 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐẠI KẾT CỤC CHIẾN THẮNG (VICTORY) */}
      {screenState === 'VICTORY' && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-2xl bg-slate-900 border border-amber-400 p-6 text-center space-y-5 shadow-2xl">
            <img
              src={hometownStoryImg}
              alt="Vinh quy bái tổ về quê hương"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover rounded-xl border border-slate-800"
            />
            <div className="text-xs font-mono text-amber-300">
              HOÀN THÀNH TRỌN VẸN 5 CHƯƠNG CỐT TRUYỆN
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              {player.story.endingTitle || 'Vinh Quy Bái Tổ — Đỉnh Cao Nhân Sinh'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sau {player.day} ngày kiên cường nơi phố thị, {player.name} (quê {player.hometown}) đã chuộc lại thành công Sổ Đỏ mảnh đất tổ tiên cho bố mẹ và tích lũy khối tài sản ròng {formatVND(netWorth)}!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setScreenState('PLAYING')}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Tiếp Tục Chơi Tự Do (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => setScreenState('TITLE_MENU')}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Tạo Nhân Vật Mới & Chơi Lại Từ Đầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GAME OVER (KIỆT SỨC / VỠ NỢ BÁT HỌ) */}
      {screenState === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-rose-500 p-6 text-center space-y-5 shadow-2xl">
            <div className="text-xs font-mono text-rose-400">
              KẾT THÚC HÀNH TRÌNH
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Gục Ngã Giữa Phố Thị
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sau {player.day} ngày bươn chải và những khoản nợ bát họ chồng chất, sức khỏe của bạn đã cạn kiệt hoàn toàn. Hãy tạo nhân vật mới để làm lại cuộc đời!
            </p>
            <button
              type="button"
              onClick={() => setScreenState('TITLE_MENU')}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm cursor-pointer"
            >
              Tạo Nhân Vật & Chơi Lại Từ Đầu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
