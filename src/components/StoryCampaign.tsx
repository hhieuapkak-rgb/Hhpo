import React, { useState } from 'react';
import {
  PlayerState,
  STORY_CHAPTERS_DATA,
  StoryChoiceOption,
  JournalEntry,
  ActiveTab,
  WIFE_CANDIDATES_DATA,
  WifeCandidate,
  LIFE_ENDINGS_DATA,
} from '../types/game';
import { formatVND, formatCompactVND, sound } from '../utils/sound';

import hometownStoryImg from '../assets/images/story_hometown_family_1790508919357.jpg';
import confrontationStoryImg from '../assets/images/story_city_confrontation_1790508932664.jpg';
import streetSceneImg from '../assets/images/vietnam_street_scene_1790508060914.jpg';
import familyWeddingImg from '../assets/images/vietnam_family_wedding_scene_1790509724055.jpg';

interface StoryCampaignProps {
  player: PlayerState;
  netWorth: number;
  journal: JournalEntry[];
  unlockedEndings: string[];
  soundEnabled: boolean;
  realTimeClockStr: string;
  realTimePeriodLabel: string;
  realTimeSpeed: 'PAUSED' | '1X' | '3X';
  onChangeRealTimeSpeed: (speed: 'PAUSED' | '1X' | '3X') => void;
  onAddCustomDiaryEntry: (title: string, detail: string, mood: string) => void;
  onDeleteDiaryEntry: (id: string) => void;
  onToggleSound: () => void;
  onSendMoneyHome: (amount: number) => void;
  onCallParents: () => void;
  onDateCandidate: (candidate: WifeCandidate, mode: 'CAFE' | 'JEWELRY') => void;
  onMarryCandidate: (candidate: WifeCandidate) => void;
  onHaveBaby: (babyName: string, gender: 'Trai' | 'Gái') => void;
  onCareForFamily: (mode: 'MILK_SCHOOL' | 'FAMILY_TRIP') => void;
  onInteractUnderworld: (mode: 'BEER_INTEL' | 'HIGH_STAKES_DUEL') => void;
  onTriggerLifeBranchDecision: (
    branchAction:
      | 'DESPAIR_BRIDGE_SUICIDE'
      | 'FLEE_DEBT_EXILE'
      | 'RISKY_CRIME_FOR_DEBT'
      | 'KNEEL_BEG_MERCY'
      | 'PEACEFUL_FAMILY_ENDING'
      | 'UNDERWORLD_KINGPIN_ENDING'
  ) => void;
  onCompleteChapterChoice: (
    chapterNumber: number,
    choice: StoryChoiceOption
  ) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCharacterCreator: () => void;
}

const SAMPLE_BABY_NAMES_BOY = [
  'Nguyễn Gia Bảo',
  'Nguyễn Minh Khôi',
  'Nguyễn Tuấn Kiệt',
  'Nguyễn Hoàng Bách',
  'Nguyễn Đăng Khoa',
];

const SAMPLE_BABY_NAMES_GIRL = [
  'Nguyễn Bảo Ngọc',
  'Nguyễn An Nhiên',
  'Nguyễn Hà My',
  'Nguyễn Khánh Ngân',
  'Nguyễn Thảo Nhi',
];

export const StoryCampaign: React.FC<StoryCampaignProps> = ({
  player,
  netWorth,
  journal = [],
  unlockedEndings = [],
  soundEnabled,
  realTimeClockStr = '07:30',
  realTimePeriodLabel = 'Buổi Sáng Phố Thị',
  realTimeSpeed = '1X',
  onChangeRealTimeSpeed,
  onAddCustomDiaryEntry,
  onDeleteDiaryEntry,
  onToggleSound,
  onSendMoneyHome,
  onCallParents,
  onDateCandidate,
  onMarryCandidate,
  onHaveBaby,
  onCareForFamily,
  onInteractUnderworld,
  onTriggerLifeBranchDecision,
  onCompleteChapterChoice,
  onNavigateTab,
  onOpenCharacterCreator,
}) => {
  const [sendAmount, setSendAmount] = useState<number>(1_000_000);
  const [viewingChapterNum, setViewingChapterNum] = useState<number>(
    Math.min(5, player.story.currentChapter)
  );
  const [babyNameInput, setBabyNameInput] = useState<string>('Nguyễn Gia Bảo');
  const [babyGenderInput, setBabyGenderInput] = useState<'Trai' | 'Gái'>('Trai');

  // State tạo Nhật ký cá nhân
  const [diaryTitle, setDiaryTitle] = useState<string>('');
  const [diaryDetail, setDiaryDetail] = useState<string>('');
  const [diaryMood, setDiaryMood] = useState<string>('Đầy quyết tâm');
  const [journalFilter, setJournalFilter] = useState<
    'ALL' | 'DIARY' | 'STORY' | 'DANGER' | 'CASINO'
  >('ALL');

  const activeChapterNum = player.story.currentChapter;
  const isCampaignCompleted = activeChapterNum > 5;

  const displayedChapter =
    STORY_CHAPTERS_DATA.find((c) => c.chapterNumber === viewingChapterNum) ||
    STORY_CHAPTERS_DATA[0];

  const totalCasinoRounds =
    player.stats.baCayRounds +
    player.stats.liengRounds +
    player.stats.taiXiuRounds;

  const totalSharkDebt = player.sharkLoans.reduce(
    (s, l) => s + l.principal + l.accruedInterest,
    0
  );
  const totalDebt = player.bankDebt + totalSharkDebt;
  const hasOverdueShark = player.sharkLoans.some((l) => player.day > l.dueDay);

  const marriedWife = player.family.marriedWifeId
    ? WIFE_CANDIDATES_DATA.find((w) => w.id === player.family.marriedWifeId)
    : null;

  // Phân tích tình hình hiện tại để định hình Nhánh Rẽ Cuộc Đời (Dynamic Life Trajectory)
  const isInDebtCrisis =
    totalDebt >= 10_000_000 ||
    player.sharkLoans.length > 0 ||
    (totalDebt > 0 && player.cash < 500_000) ||
    player.sanity <= 35;

  const canUnlockPeacefulFamilyEnding =
    Boolean(marriedWife) &&
    player.family.children.length >= 1 &&
    totalDebt === 0 &&
    player.story.familyDebtRemaining <= 50_000_000;

  const canUnlockKingpinEnding =
    player.story.underworldRespect >= 55 &&
    player.stats.totalWonCasino >= 15_000_000;

  // Kiểm tra tiến độ từng mục tiêu của chương hiện tại
  const getChapterObjectivesStatus = (chapterNum: number) => {
    if (chapterNum === 1) {
      return [
        {
          label: `Gửi về quê tối thiểu 3.000.000 ₫ viện phí cho bố (Hiện đã gửi: ${formatVND(
            player.story.moneySentHomeTotal
          )})`,
          done: player.story.moneySentHomeTotal >= 3_000_000,
        },
        {
          label: `Đạt 20 EXP làm việc hoặc chơi 2 ván Chiếu Bạc (Hiện tại: ${player.workExp} EXP · ${totalCasinoRounds} ván bạc)`,
          done: player.workExp >= 20 || totalCasinoRounds >= 2,
        },
      ];
    }

    if (chapterNum === 2) {
      const maxAffection = Math.max(
        player.story.maiAnhAffection,
        ...Object.values(player.family.affectionMap || { mai_anh: 0 })
      );
      return [
        {
          label: `Sở hữu ít nhất 1 Tài sản / Phương tiện làm ăn (Hiện có: ${player.assets.length} tài sản)`,
          done: player.assets.length >= 1,
        },
        {
          label: `Tổng tiền gửi về quê đạt ≥ 15.000.000 ₫ (Hiện đã gửi: ${formatVND(
            player.story.moneySentHomeTotal
          )})`,
          done: player.story.moneySentHomeTotal >= 15_000_000,
        },
        {
          label: `Độ thân thiết bạn gái ≥ 25 hoặc Độ nể giang hồ ≥ 25 (Tình cảm: ${maxAffection} · Giang hồ: ${player.story.underworldRespect})`,
          done: maxAffection >= 25 || player.story.underworldRespect >= 25,
        },
      ];
    }

    if (chapterNum === 3) {
      const upgradedHousing = player.housingId !== 'phong_tro_mai_ton';
      return [
        {
          label: `Giảm nợ Sổ Đỏ quê nhà xuống ≤ 100.000.000 ₫ (Nợ quê còn: ${formatVND(
            player.story.familyDebtRemaining
          )})`,
          done: player.story.familyDebtRemaining <= 100_000_000,
        },
        {
          label: `Nâng cấp chỗ ở lên Chung Cư Mini hoặc cao hơn (Đang ở: ${
            upgradedHousing ? 'Đã nâng cấp' : 'Phòng trọ mái tôn'
          })`,
          done: upgradedHousing,
        },
        {
          label: `Đạt 100 EXP làm việc hoặc đã chơi 5 ván Chiếu Bạc (${player.workExp} EXP · ${totalCasinoRounds} ván)`,
          done: player.workExp >= 100 || totalCasinoRounds >= 5,
        },
      ];
    }

    if (chapterNum === 4) {
      const hasHighAsset = player.assets.some((a) =>
        ['vang_sjc', 'xe_sh', 'xe_oto_sedan', 'so_do_dat_nen'].includes(
          a.assetId
        )
      );
      return [
        {
          label:
            'Sở hữu ít nhất 1 Tài sản cao cấp (Vàng SJC, Xe SH 150i, Ô tô Sedan hoặc Sổ đỏ đất nền)',
          done: hasHighAsset,
        },
        {
          label: `Giảm nợ Sổ Đỏ quê nhà xuống ≤ 40.000.000 ₫ (Nợ quê còn: ${formatVND(
            player.story.familyDebtRemaining
          )})`,
          done: player.story.familyDebtRemaining <= 40_000_000,
        },
        {
          label: `Tổng Tài Sản Ròng đạt ≥ 100.000.000 ₫ (Hiện tại: ${formatVND(
            netWorth
          )})`,
          done: netWorth >= 100_000_000,
        },
      ];
    }

    return [
      {
        label: `Thanh toán sạch 100% Nợ Sổ Đỏ Quê Nhà (Còn lại: ${formatVND(
          player.story.familyDebtRemaining
        )})`,
        done: player.story.familyDebtRemaining <= 0,
      },
      {
        label: `Không còn nợ Ngân hàng & Bát Họ (Tổng nợ hiện tại: ${formatVND(
          totalDebt
        )})`,
        done: totalDebt <= 0,
      },
      {
        label: `Đạt Tổng Tài Sản Ròng ≥ 200.000.000 ₫ (Hiện tại: ${formatVND(
          netWorth
        )})`,
        done: netWorth >= 200_000_000,
      },
    ];
  };

  const currentObjectives = getChapterObjectivesStatus(
    displayedChapter.chapterNumber
  );
  const allObjectivesMet =
    displayedChapter.chapterNumber === activeChapterNum &&
    currentObjectives.every((o) => o.done);

  const bannerImage =
    displayedChapter.bannerType === 'HOMETOWN'
      ? hometownStoryImg
      : displayedChapter.bannerType === 'CONFRONTATION'
      ? confrontationStoryImg
      : streetSceneImg;

  return (
    <div className="space-y-8">
      {/* Banner Cốt Truyện Chính */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="aspect-[21/8] w-full relative overflow-hidden bg-slate-950">
          <img
            src={bannerImage}
            alt={displayedChapter.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-xs font-medium text-amber-300 mb-1">
                Cốt Truyện & Nhánh Rẽ Nhân Sinh · Xuất thân:{' '}
                {player.backgroundTitle} · Quê {player.hometown}
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                {isCampaignCompleted
                  ? `Hoàn Thành Đại Kết Cục: ${player.story.endingTitle}`
                  : displayedChapter.title}
              </h1>
              <p className="text-sm text-slate-300 mt-1">
                {displayedChapter.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/95 border border-rose-500/40">
                <div className="text-[11px] text-slate-400">
                  Nợ Sổ Đỏ Quê Nhà Còn Lại
                </div>
                <div className="text-lg font-mono font-bold text-rose-400 tabular-nums">
                  {formatVND(player.story.familyDebtRemaining)}
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCharacterCreator}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
              >
                Tạo Nhân Vật Mới / Chơi Lại
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== NHỊP SỐNG & CỐT TRUYỆN THỜI GIAN THỰC ==================== */}
      <div className="rounded-2xl border border-amber-500/40 bg-slate-900/95 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  realTimeSpeed === 'PAUSED'
                    ? 'bg-slate-400'
                    : 'bg-emerald-400 animate-ping'
                }`}
              />
              ĐỒNG HỒ CỐT TRUYỆN THỜI GIAN THỰC: {realTimeClockStr} ({realTimePeriodLabel})
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">
              Ngày {player.day} · Tuổi {player.age}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Thời gian trong game trôi liên tục theo nhịp sống thực tế: các tin nhắn từ mẹ ở quê, vợ con, biến động thị trường đầu tư và cuộc gọi đòi nợ sẽ tự động diễn ra theo từng khung giờ sáng, trưa, chiều, tối.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 mr-1">Tốc độ thời gian thực:</span>
          {(
            [
              { id: 'PAUSED', label: 'Tạm Dừng' },
              { id: '1X', label: 'Thực Tế 1x' },
              { id: '3X', label: 'Tua Nhanh 3x' },
            ] as const
          ).map((spd) => (
            <button
              key={spd.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onChangeRealTimeSpeed(spd.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                realTimeSpeed === spd.id
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spd.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== BẢNG RẼ NHÁNH CUỘC ĐỜI THEO TÌNH HÌNH HIỆN TẠI ==================== */}
      <div
        className={`rounded-2xl border p-6 space-y-4 ${
          isInDebtCrisis
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg'
            : 'bg-slate-900/90 border-amber-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-amber-300">
              NHÁNH RẼ CUỘC ĐỜI THEO TÌNH HÌNH HIỆN TẠI (NGÀY {player.day})
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              {isInDebtCrisis
                ? 'Tình Trạng: Khủng Hoảng Nợ Nần & Bát Họ Bủa Vây — Ngã Rẽ Sinh Tử!'
                : marriedWife
                ? `Tình Trạng: Đã Lập Gia Đình Cùng ${marriedWife.name} (${player.family.children.length} con)`
                : 'Tình Trạng: Độc Thân Bươn Chải Giữa Phố Thị — Tự Do Rẽ Hướng'}
            </h2>
          </div>

          <div className="text-xs font-mono text-slate-300">
            Đã mở khóa: <strong className="text-amber-300">{unlockedEndings.length}/{LIFE_ENDINGS_DATA.length}</strong> Kết Thúc Cuộc Đời
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isInDebtCrisis
            ? `Bạn đang gánh khoản nợ Ngân hàng & Bát Họ ${formatVND(
                totalDebt
              )} (Tiền mặt còn: ${formatVND(player.cash)} · Tinh thần: ${
                player.sanity
              }/100${
                hasOverdueShark ? ' · ĐANG QUÁ HẠN BÁT HỌ!' : ''
              }). Trong lúc túng quẫn bị chủ nợ dồn ép, một quyết định lúc này có thể khép lại cuộc đời hoặc đẩy bạn sang ngã rẽ hoàn toàn khác:`
            : 'Mỗi hành động vay nợ, đánh bạc, lấy vợ sinh con hay tích lũy tài sản đều mở ra các ngã rẽ và kết cục khác nhau ngay trong quá trình chơi:'}
        </p>

        {/* Các nút Rẽ Nhánh Cuộc Đời Tức Thì */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Nhánh 1: Nợ cao không trả nổi -> Quẫn trí trên cầu đêm mưa */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-rose-400 font-bold">
                NHÁNH BI KỊCH #01
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Tuyệt Vọng Trên Cầu Đêm Mưa
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Khi nợ nần chồng chất không còn khả năng chi trả, tinh thần suy sụp dẫn tới kết cục bi thảm nhất (Tự tử vì nợ cao).
              </p>
            </div>
            <button
              type="button"
              disabled={!isInDebtCrisis && totalDebt < 5_000_000}
              onClick={() =>
                onTriggerLifeBranchDecision('DESPAIR_BRIDGE_SUICIDE')
              }
              className="w-full py-2 px-3 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isInDebtCrisis || totalDebt >= 5_000_000
                ? 'Buông Xuôi Tất Cả Trên Cầu Đêm Mưa'
                : 'Chỉ mở khi đang mắc nợ ≥ 5 Triệu'}
            </button>
          </div>

          {/* Nhánh 2: Bỏ trốn nợ biệt xứ */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-amber-300 font-bold">
                NHÁNH ĐÀO TẨU #02
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Bỏ Trốn Nợ Biệt Xứ Trong Đêm
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Bỏ lại tất cả nhà cửa, quê hương và người thân để bắt xe khách trốn giang hồ truy sát lúc 2h sáng.
              </p>
            </div>
            <button
              type="button"
              disabled={!isInDebtCrisis && totalDebt < 5_000_000}
              onClick={() => onTriggerLifeBranchDecision('FLEE_DEBT_EXILE')}
              className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              {isInDebtCrisis || totalDebt >= 5_000_000
                ? 'Bắt Xe Đêm Trốn Nợ Biệt Xứ'
                : 'Chỉ mở khi đang mắc nợ ≥ 5 Triệu'}
            </button>
          </div>

          {/* Nhánh 3: Làm liều phi vụ phi pháp (50/50 Xóa sạch nợ hoặc Đi Tù) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-purple-300 font-bold">
                NHÁNH LÀM LIỀU #03 (50/50)
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                Phi Vụ Ngầm: Xóa Nợ Hoặc Vào Tù
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Nhận vận chuyển hàng cấm cho Ông Trùm: 45% cơ hội xóa sạch nợ Bát Họ + 15 Triệu; 55% bị bắt vào trại giam!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTriggerLifeBranchDecision('RISKY_CRIME_FOR_DEBT')}
              className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đánh Cược Tự Do Làm Phi Vụ Ngầm
            </button>
          </div>

          {/* Nhánh 4: Kết thúc Viên Mãn Gia Đình hoặc Bá Chủ Giang Hồ */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                NHÁNH THÀNH ĐẠT / TỔ ẤM
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {canUnlockKingpinEnding
                  ? 'Soán Ngôi Ông Trùm Chiếu Bạc'
                  : 'An Phận Viên Mãn Bên Vợ Con'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {canUnlockKingpinEnding
                  ? 'Độ nể giang hồ & tiền thắng bạc của bạn đã đủ để lật đổ Ông Trùm, độc chiếm sới bạc!'
                  : 'Cưới vợ, sinh con, sạch nợ vay và giảm nợ quê ≤ 50Tr để khép lại cuộc đời trong hạnh phúc bình dị.'}
              </p>
            </div>
            {canUnlockKingpinEnding ? (
              <button
                type="button"
                onClick={() =>
                  onTriggerLifeBranchDecision('UNDERWORLD_KINGPIN_ENDING')
                }
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Lật Đổ Ông Trùm · Thống Lĩnh Sới Bạc
              </button>
            ) : (
              <button
                type="button"
                disabled={!canUnlockPeacefulFamilyEnding}
                onClick={() =>
                  onTriggerLifeBranchDecision('PEACEFUL_FAMILY_ENDING')
                }
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                {canUnlockPeacefulFamilyEnding
                  ? 'Chọn Kết Cục Tổ Ấm Bình Yên'
                  : 'Cần: Có Vợ + Có Con + Không Nợ Vay'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ==================== KHU VỰC HÔN NHÂN: LẤY VỢ & SINH CON ==================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Hình minh họa Đám Cưới & Tổ Ấm Gia Đình */}
          <div className="lg:col-span-5 relative min-h-[260px] bg-slate-950">
            <img
              src={familyWeddingImg}
              alt="Đám cưới truyền thống Việt Nam với áo dài đỏ và tổ ấm gia đình hạnh phúc bên con nhỏ"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
              <span className="text-xs font-medium text-amber-300">
                Duyên Phận & Tổ Ấm Việt Nam
              </span>
              <h2 className="text-2xl font-display font-bold text-white">
                {marriedWife
                  ? `Tổ Ấm Cùng ${marriedWife.name}`
                  : 'Tán Tỉnh, Cưới Vợ & Sinh Con'}
              </h2>
              <p className="text-xs text-slate-200">
                {marriedWife
                  ? `Kết hôn từ Ngày ${player.family.weddingDay} · Đã có ${player.family.children.length} con · Vợ phụ giúp +${formatVND(marriedWife.dailyIncomeHelp)}/ngày`
                  : 'Hẹn hò 3 bóng hồng phố thị, tổ chức lễ cưới truyền thống nhận phong bì mừng cưới và đón những thiên thần nhỏ chào đời.'}
              </p>
            </div>
          </div>

          {/* Nội dung Tán Tỉnh / Cưới Vợ / Sinh Con */}
          <div className="lg:col-span-7 p-6 space-y-6">
            {!marriedWife ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    Chọn Bóng Hồng Để Hẹn Hò & Cầu Hôn:
                  </h3>
                  <span className="text-xs text-slate-400">
                    Khi cưới sẽ nhận lại Tiền Mừng Cưới & Của Hồi Môn!
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {WIFE_CANDIDATES_DATA.map((cand) => {
                    const affection =
                      player.family.affectionMap[cand.id] ??
                      (cand.id === 'mai_anh' ? player.story.maiAnhAffection : 0);
                    const housingOk =
                      !cand.reqHousingNonSlum ||
                      player.housingId !== 'phong_tro_mai_ton';
                    const repOk = player.reputation >= cand.minReputation;
                    const assetOk =
                      !cand.reqAssetId ||
                      player.assets.some(
                        (a) => a.assetId === cand.reqAssetId && !a.isPawned
                      );
                    const canMarry =
                      affection >= cand.minAffectionToMarry &&
                      housingOk &&
                      repOk &&
                      assetOk &&
                      player.cash >= cand.weddingCost;

                    return (
                      <div
                        key={cand.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-white">
                              {cand.name}{' '}
                              <span className="text-xs font-normal text-amber-300">
                                ({cand.role})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {cand.personality} · Khi cưới: +
                              {formatCompactVND(cand.dailyIncomeHelp)}/ngày
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs text-sky-400 font-bold">
                              Tình cảm: {affection}/{cand.minAffectionToMarry}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {cand.description}
                        </p>

                        <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                          <span
                            className={
                              repOk ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            Uy tín ≥ {cand.minReputation}
                          </span>
                          <span>·</span>
                          <span
                            className={
                              housingOk ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {cand.reqHousingNonSlum
                              ? 'Cần ở Chung cư mini trở lên'
                              : 'Chấp nhận ở Phòng trọ'}
                          </span>
                          {cand.reqAssetId && (
                            <>
                              <span>·</span>
                              <span
                                className={
                                  assetOk ? 'text-emerald-400' : 'text-rose-400'
                                }
                              >
                                Cần Xe SH 150i
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span className="text-amber-300">
                            Cỗ cưới: {formatCompactVND(cand.weddingCost)} (Mừng cưới lại{' '}
                            {formatCompactVND(cand.dowryAndGiftRange[0])}–
                            {formatCompactVND(cand.dowryAndGiftRange[1])})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={player.cash < 100_000}
                            onClick={() => onDateCandidate(cand, 'CAFE')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                          >
                            Hẹn Hò Cà Phê (100k · +10 Tình cảm)
                          </button>
                          <button
                            type="button"
                            disabled={player.cash < 800_000}
                            onClick={() => onDateCandidate(cand, 'JEWELRY')}
                            className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                          >
                            Tặng Trang Sức (800k · +25 Tình cảm)
                          </button>
                          <button
                            type="button"
                            disabled={!canMarry}
                            onClick={() => onMarryCandidate(cand)}
                            className="ml-auto px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            Cầu Hôn & Tổ Chức Đám Cưới ({formatCompactVND(cand.weddingCost)})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* KHI ĐÃ KẾT HÔN: QUẢN LÝ TỔ ẤM & SINH CON */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-emerald-400">
                      NGƯỜI VỢ ĐỒNG HÀNH TRỌN ĐỜI
                    </div>
                    <div className="text-base font-bold text-white">
                      {marriedWife.name} · {marriedWife.role}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Thu nhập vợ đóng góp: +{formatVND(marriedWife.dailyIncomeHelp)}/ngày · Hạnh phúc hôn nhân: {player.family.maritalHappiness}/100
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={player.cash < 1_500_000}
                      onClick={() => onCareForFamily('FAMILY_TRIP')}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                    >
                      Du Lịch Gia Đình (1.5Tr · +25 Hạnh phúc)
                    </button>
                  </div>
                </div>

                {/* Khu vực Sinh Con & Đặt Tên Con */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      Sinh Con & Đặt Tên Cho Thiên Thần Nhỏ (Chi phí viện sản & đầy tháng: 5.000.000 ₫)
                    </h4>
                    <span className="text-xs font-mono text-amber-300">
                      Hiện có: {player.family.children.length} con
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-3 flex gap-1.5">
                      {(['Trai', 'Gái'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setBabyGenderInput(g);
                            const pool =
                              g === 'Trai'
                                ? SAMPLE_BABY_NAMES_BOY
                                : SAMPLE_BABY_NAMES_GIRL;
                            setBabyNameInput(
                              pool[Math.floor(Math.random() * pool.length)]
                            );
                          }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                            babyGenderInput === g
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Bé {g}
                        </button>
                      ))}
                    </div>

                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        value={babyNameInput}
                        onChange={(e) => setBabyNameInput(e.target.value)}
                        placeholder="Nhập họ tên cho con..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <button
                        type="button"
                        disabled={player.cash < 5_000_000}
                        onClick={() =>
                          onHaveBaby(
                            babyNameInput.trim() || 'Nguyễn Gia Bảo',
                            babyGenderInput
                          )
                        }
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs cursor-pointer"
                      >
                        Đón Con Chào Đời (5Tr)
                      </button>
                    </div>
                  </div>

                  {/* Danh sách các con đã sinh */}
                  {player.family.children.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Danh sách các con của bạn & {marriedWife.name}:
                        </span>
                        <button
                          type="button"
                          disabled={player.cash < 500_000}
                          onClick={() => onCareForFamily('MILK_SCHOOL')}
                          className="text-xs font-bold text-amber-300 hover:underline cursor-pointer"
                        >
                          Mua Sữa & Đóng Học Cho Con (500k · +15 Thông minh)
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {player.family.children.map((child) => (
                          <div
                            key={child.id}
                            className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">
                                {child.name} (Bé {child.gender})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Giai đoạn: {child.ageStage} · Sinh ngày {child.birthDay}
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="text-amber-300 font-semibold">
                                IQ: {child.smartPoints}
                              </div>
                              <div className="text-emerald-400 text-[11px]">
                                Vui vẻ: {child.happiness}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thanh tiến trình 5 Chương Cốt Truyện */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
        {STORY_CHAPTERS_DATA.map((ch) => {
          const isCompleted = player.story.completedChapters.includes(
            ch.chapterNumber
          );
          const isCurrent = ch.chapterNumber === activeChapterNum;
          const isSelected = ch.chapterNumber === viewingChapterNum;

          return (
            <button
              key={ch.chapterNumber}
              type="button"
              onClick={() => {
                sound.playClick();
                if (ch.chapterNumber <= activeChapterNum) {
                  setViewingChapterNum(ch.chapterNumber);
                }
              }}
              disabled={ch.chapterNumber > activeChapterNum}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-200'
                  : isCurrent
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-950/50 text-slate-500 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-[11px] font-mono">
                Chương 0{ch.chapterNumber} ·{' '}
                {isCompleted
                  ? 'Đã Hoàn Thành'
                  : isCurrent
                  ? 'Đang Diễn Ra'
                  : 'Chưa Mở'}
              </div>
              <div className="text-xs truncate mt-0.5">
                {ch.title.replace(/^Chương \d:\s*/, '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Khu vực Đối Thoại Cốt Truyện & Nhiệm Vụ Chương */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột Trái (7/12): Hội Thoại Cốt Truyện & Rẽ Nhánh Quyết Định */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-amber-300">
                  DIỄN BIẾN CỐT TRUYỆN CHƯƠNG {displayedChapter.chapterNumber}
                </span>
                <h2 className="text-xl font-display font-bold text-white mt-0.5">
                  {displayedChapter.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Con đường:{' '}
                {player.story.karmaPath === 'CHINH_DAO'
                  ? 'Chính Đạo'
                  : player.story.karmaPath === 'GIANG_HO'
                  ? 'Giang Hồ Đỏ Đen'
                  : 'Cân Bằng'}
              </span>
            </div>

            <div className="space-y-3">
              {displayedChapter.introDialogue.map((dlg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">
                      {dlg.speaker}
                    </span>
                    <span className="text-slate-400 italic">{dlg.role}</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    &ldquo;{dlg.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white">
              Điều Kiện Hoàn Thành Chương {displayedChapter.chapterNumber}:
            </h3>

            <div className="space-y-2">
              {currentObjectives.map((obj, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    obj.done
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <span>{obj.label}</span>
                  <span className="font-mono font-bold whitespace-nowrap">
                    {obj.done ? '[ĐÃ ĐẠT]' : '[CHƯA ĐẠT]'}
                  </span>
                </div>
              ))}
            </div>

            {player.story.completedChapters.includes(
              displayedChapter.chapterNumber
            ) ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200">
                Bạn đã hoàn thành Chương {displayedChapter.chapterNumber}! Hãy chuyển sang chương tiếp theo trên thanh tiến trình.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-amber-300">
                  {allObjectivesMet
                    ? 'Tất cả điều kiện đã đủ! Hãy chọn hướng đi quyết định của bạn để sang chương mới:'
                    : 'Hoàn thành đủ các điều kiện trên để mở khóa Lựa Chọn Bước Ngoặt Cốt Truyện:'}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {displayedChapter.choices.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={!allObjectivesMet}
                      onClick={() => {
                        onCompleteChapterChoice(
                          displayedChapter.chapterNumber,
                          ch
                        );
                        if (displayedChapter.chapterNumber < 5) {
                          setViewingChapterNum(
                            displayedChapter.chapterNumber + 1
                          );
                        }
                      }}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        allObjectivesMet
                          ? 'bg-slate-950 hover:bg-slate-800 border-amber-400/60 cursor-pointer shadow-md'
                          : 'bg-slate-950/50 border-slate-800 opacity-55 cursor-not-allowed'
                      }`}
                    >
                      <div className="text-sm font-bold text-amber-300">
                        {ch.label}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {ch.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải (5/12): Tương Tác Gia Đình Quê Nhà & Giang Hồ */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Gia Đình Ở Quê & Trả Nợ Sổ Đỏ */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <div className="text-xs text-amber-300 font-medium">
                Báo Hiếu Cha Mẹ · Quê {player.hometown}
              </div>
              <h3 className="text-lg font-display font-bold text-white">
                01. Bà Lan (Mẹ Ở Quê) & Sổ Đỏ Đất Tổ
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Đã gửi về quê tổng cộng:{' '}
                <strong className="font-mono text-emerald-400">
                  {formatVND(player.story.moneySentHomeTotal)}
                </strong>{' '}
                · Nợ quê còn:{' '}
                <strong className="font-mono text-rose-400">
                  {formatVND(player.story.familyDebtRemaining)}
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[1_000_000, 3_000_000, 10_000_000, 30_000_000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setSendAmount(amt);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                    sendAmount === amt
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {formatCompactVND(amt)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={player.cash < sendAmount}
                onClick={() => onSendMoneyHome(sendAmount)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Gửi Về Quê {formatCompactVND(sendAmount)}
              </button>
              {player.story.familyDebtRemaining > 0 && (
                <button
                  type="button"
                  disabled={player.cash < player.story.familyDebtRemaining}
                  onClick={() =>
                    onSendMoneyHome(player.story.familyDebtRemaining)
                  }
                  className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Chuộc Đứt Sổ Đỏ (
                  {formatCompactVND(player.story.familyDebtRemaining)})
                </button>
              )}
              <button
                type="button"
                disabled={player.energy < 10}
                onClick={onCallParents}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Gọi Điện Hỏi Thăm Bố Mẹ (-10 Thể lực · +12 Tinh thần · +2 Uy tín)
              </button>
            </div>
          </div>

          {/* 2. Hùng Bến Cảng & Thế Giới Ngầm */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs text-rose-400 font-medium">
                  Quan Hệ Xã Hội & Chiếu Bạc
                </div>
                <h3 className="text-lg font-display font-bold text-white">
                  02. Hùng &ldquo;Bến Cảng&rdquo; & Đàn Em Lão Hạc
                </h3>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">Độ nể giang hồ</div>
                <div className="text-sm font-bold text-rose-400">
                  {player.story.underworldRespect}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={player.cash < 200_000}
                onClick={() => onInteractUnderworld('BEER_INTEL')}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Mời Bia Hỏi Tin (200k · +12 Độ nể)
              </button>
              <button
                type="button"
                disabled={player.cash < 2_000_000 || player.energy < 20}
                onClick={() => onInteractUnderworld('HIGH_STAKES_DUEL')}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Đấu Bài Cắt Nợ Quê (Cược 2Tr)
              </button>
            </div>
          </div>

          {/* 3. Bộ Sưu Tập 7 Kết Thúc Cuộc Đời */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-base font-display font-bold text-white">
                03. Bộ Sưu Tập 7 Kết Cục Cuộc Đời
              </h3>
              <span className="text-xs font-mono text-amber-300">
                Đã mở: {unlockedEndings.length}/{LIFE_ENDINGS_DATA.length}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {LIFE_ENDINGS_DATA.map((end) => {
                const isUnlocked = unlockedEndings.includes(end.id);
                return (
                  <div
                    key={end.id}
                    className={`p-3 rounded-xl border text-xs ${
                      isUnlocked
                        ? 'bg-slate-950 border-amber-400/50 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span
                        className={
                          end.category === 'BI_KICH'
                            ? 'text-rose-400 font-bold'
                            : 'text-amber-300 font-bold'
                        }
                      >
                        {end.code}
                      </span>
                      <span>{isUnlocked ? '[ĐÃ MỞ KHÓA]' : '[CHƯA MỞ]'}</span>
                    </div>
                    <div className="font-bold text-sm mt-0.5">{end.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Điều kiện: {end.conditionHint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SỔ TAY NHẬT KÝ ĐỜI TÔI (TỰ VIẾT & DẤU MỐC THỜI GIAN THỰC) ==================== */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs text-amber-300 font-medium">
              Lưu Giữ Ký Ức & Tự Viết Tâm Sự Đời Thường
            </div>
            <h2 className="text-xl font-display font-bold text-white">
              Sổ Tay Nhật Ký Cuộc Đời ({journal.length} trang viết)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bạn có thể tự tay viết nhật ký mỗi ngày hoặc xem lại toàn bộ biến cố thời gian thực của {player.name}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 whitespace-nowrap cursor-pointer"
            >
              Âm thanh: {soundEnabled ? 'Đang Bật' : 'Đang Tắt'}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('STREET')}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 whitespace-nowrap cursor-pointer"
            >
              Ra Khu Phố Kiếm Tiền
            </button>
          </div>
        </div>

        {/* Khung Tự Viết Nhật Ký Cá Nhân */}
        <div className="rounded-xl bg-slate-950 border border-amber-500/30 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                Viết Trang Nhật Ký Mới (Ngày {player.day} · {realTimeClockStr})
              </h3>
              <p className="text-xs text-slate-400">
                Ghi lại tâm trạng, mục tiêu trả nợ hoặc cảm xúc của bạn lúc này (Giúp giải tỏa tâm lý +8 Tinh thần).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (isInDebtCrisis) {
                  setDiaryTitle(`Đêm trắng lo nợ nần chồng chất (Ngày ${player.day})`);
                  setDiaryDetail(
                    `Hôm nay trong túi chỉ còn ${formatVND(
                      player.cash
                    )} mà khoản nợ đã lên tới ${formatVND(
                      totalDebt
                    )}. Tiếng chuông điện thoại làm mình giật mình thon thót. Phải cố gắng giữ bình tĩnh tìm đường xoay sở, không được bỏ cuộc...`
                  );
                  setDiaryMood('Lo âu & Áp lực');
                } else if (marriedWife) {
                  setDiaryTitle(
                    `Bình yên bên ${marriedWife.name} sau giờ làm (Ngày ${player.day})`
                  );
                  setDiaryDetail(
                    `Trở về nhà lúc ${realTimeClockStr}, nhìn mâm cơm nóng hổi ${
                      marriedWife.name
                    } chuẩn bị${
                      player.family.children.length > 0
                        ? ` và nghe tiếng cười của ${player.family.children.length} con`
                        : ''
                    }, mọi mệt mỏi nơi phố thị đều tan biến. Hiện tài sản ròng đạt ${formatVND(
                      netWorth
                    )}.`
                  );
                  setDiaryMood('Hạnh phúc & Biết ơn');
                } else {
                  setDiaryTitle(
                    `Dấu mốc mưu sinh nơi phố thị (Ngày ${player.day})`
                  );
                  setDiaryDetail(
                    `Lại một ngày vất vả khép lại lúc ${realTimeClockStr}. Hiện tại mình đang có ${formatVND(
                      player.cash
                    )} tiền mặt, nợ Sổ Đỏ quê nhà còn ${formatVND(
                      player.story.familyDebtRemaining
                    )}. Tự hứa sẽ sớm chuộc lại đất tổ cho bố mẹ!`
                  );
                  setDiaryMood('Đầy quyết tâm');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 whitespace-nowrap cursor-pointer"
            >
              Gợi Ý Tự Động Theo Tình Hình Hiện Tại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">
                Tiêu đề trang nhật ký
              </label>
              <input
                type="text"
                value={diaryTitle}
                onChange={(e) => setDiaryTitle(e.target.value)}
                placeholder="VD: Ngày đầu được thăng chức / Đêm mưa nhớ quê..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tâm trạng hiện tại
              </label>
              <select
                value={diaryMood}
                onChange={(e) => setDiaryMood(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-amber-300 focus:outline-none focus:border-amber-400"
              >
                <option value="Đầy quyết tâm">Đầy quyết tâm</option>
                <option value="Hạnh phúc & Biết ơn">Hạnh phúc & Biết ơn</option>
                <option value="Lo âu & Áp lực">Lo âu & Áp lực</option>
                <option value="Nhớ bố mẹ ở quê">Nhớ bố mẹ ở quê</option>
                <option value="Hối hận vì đỏ đen">Hối hận vì đỏ đen</option>
                <option value="Hào hứng đầu tư">Hào hứng đầu tư</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Nội dung dòng tâm sự
            </label>
            <textarea
              rows={2}
              value={diaryDetail}
              onChange={(e) => setDiaryDetail(e.target.value)}
              placeholder="Viết những suy nghĩ, dự định trả nợ, chuyện tình cảm hoặc bài học xương máu sau những canh bạc..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!diaryTitle.trim() && !diaryDetail.trim()}
              onClick={() => {
                const finalTitle =
                  diaryTitle.trim() || `Nhật ký ngày ${player.day}`;
                const finalDetail =
                  diaryDetail.trim() ||
                  `Ghi chép nhanh lúc ${realTimeClockStr} với tâm trạng ${diaryMood}.`;
                onAddCustomDiaryEntry(finalTitle, finalDetail, diaryMood);
                setDiaryTitle('');
                setDiaryDetail('');
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Lưu Vào Sổ Nhật Ký (+8 Tinh thần)
            </button>
          </div>
        </div>

        {/* Bộ lọc Nhật ký */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: `Tất cả (${journal.length})` },
                {
                  id: 'DIARY',
                  label: `Nhật ký tự viết (${
                    journal.filter((j) => j.isUserWritten || j.type === 'diary')
                      .length
                  })`,
                },
                {
                  id: 'STORY',
                  label: `Tích cực & Gia đình (${
                    journal.filter((j) => j.type === 'positive').length
                  })`,
                },
                {
                  id: 'DANGER',
                  label: `Biến cố & Nợ (${
                    journal.filter(
                      (j) => j.type === 'danger' || j.type === 'negative'
                    ).length
                  })`,
                },
                {
                  id: 'CASINO',
                  label: `Chiếu bạc (${
                    journal.filter((j) => j.type === 'casino').length
                  })`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setJournalFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  journalFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {journal
            .filter((entry) => {
              if (journalFilter === 'DIARY')
                return entry.isUserWritten || entry.type === 'diary';
              if (journalFilter === 'STORY') return entry.type === 'positive';
              if (journalFilter === 'DANGER')
                return entry.type === 'danger' || entry.type === 'negative';
              if (journalFilter === 'CASINO') return entry.type === 'casino';
              return true;
            })
            .map((entry) => (
              <div
                key={entry.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-2 ${
                  entry.isUserWritten || entry.type === 'diary'
                    ? 'bg-amber-950/20 border-amber-400/50'
                    : entry.type === 'danger'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : entry.type === 'positive'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800/90'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono font-bold text-amber-300">
                      Ngày {entry.day}
                      {entry.timeStr ? ` · ${entry.timeStr}` : ''}
                    </span>
                    {entry.isUserWritten && (
                      <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold text-[11px]">
                        Nhật ký tự viết · {entry.mood || 'Tâm sự'}
                      </span>
                    )}
                    <span>·</span>
                    <span className="font-semibold text-white">
                      {entry.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {entry.detail}
                  </p>
                </div>

                {entry.isUserWritten && (
                  <button
                    type="button"
                    onClick={() => onDeleteDiaryEntry(entry.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-400 self-end sm:self-center shrink-0 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
