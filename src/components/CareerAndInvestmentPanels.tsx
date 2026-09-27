import React from 'react';
import {
  PlayerState,
  CAREER_RANKS_DATA,
  TRAINING_COURSES_DATA,
  INVESTMENT_CHANNELS_DATA,
  TrainingCourse,
  InvestmentChannel,
} from '../types/game';
import { formatVND, formatCompactVND } from '../utils/sound';

interface CareerPromotionPanelProps {
  player: PlayerState;
  onTakeTrainingCourse: (course: TrainingCourse) => void;
  onApplyPromotion: () => void;
}

export const CareerPromotionPanel: React.FC<CareerPromotionPanelProps> = ({
  player,
  onTakeTrainingCourse,
  onApplyPromotion,
}) => {
  const currentRank =
    CAREER_RANKS_DATA.find((r) => r.rankIndex === player.careerRankIndex) ||
    CAREER_RANKS_DATA[0];
  const nextRank = CAREER_RANKS_DATA.find(
    (r) => r.rankIndex === player.careerRankIndex + 1
  );

  const hasReqCourseForNext =
    !nextRank?.reqCourseId ||
    player.completedCourseIds.includes(nextRank.reqCourseId);
  const canPromote =
    Boolean(nextRank) &&
    player.workExp >= (nextRank?.minExp || 0) &&
    player.reputation >= (nextRank?.minReputation || 0) &&
    hasReqCourseForNext;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-slate-900/95 p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-medium text-amber-300">
            Lộ Trình Thăng Tiến Sự Nghiệp & Đào Tạo Nghiệp Vụ
          </div>
          <h2 className="text-xl font-display font-bold text-white mt-0.5">
            Cấp Bậc Hiện Tại: {currentRank.title} (Hệ số lương x
            {currentRank.payMultiplier.toFixed(2)})
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {currentRank.perkText}{' '}
            {currentRank.dailyBaseSalary > 0 && (
              <span className="text-emerald-400 font-mono font-bold">
                · Đang nhận lương cứng +{formatVND(currentRank.dailyBaseSalary)}
                /ngày
              </span>
            )}
          </p>
        </div>

        {nextRank ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs space-y-0.5">
              <div className="text-slate-400">
                Mục tiêu thăng chức tiếp theo:
              </div>
              <div className="font-bold text-amber-300">{nextRank.title}</div>
              <div className="font-mono text-[11px] text-slate-300">
                Yêu cầu: {player.workExp}/{nextRank.minExp} EXP · Uy tín{' '}
                {player.reputation}/{nextRank.minReputation}
                {nextRank.reqCourseId
                  ? ` · Cần chứng chỉ (${
                      hasReqCourseForNext ? 'Đã có' : 'Chưa học'
                    })`
                  : ''}
              </div>
            </div>
            <button
              type="button"
              disabled={!canPromote}
              onClick={onApplyPromotion}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Xét Thăng Chức Ngay
            </button>
          </div>
        ) : (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            Đã Đạt Đỉnh Cao Sự Nghiệp: Giám Đốc Điều Hành (CEO)
          </div>
        )}
      </div>

      {/* Bậc thang 5 cấp độ */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {CAREER_RANKS_DATA.map((rk) => {
          const isCurrent = rk.rankIndex === player.careerRankIndex;
          const isPassed = rk.rankIndex < player.careerRankIndex;
          return (
            <div
              key={rk.rankIndex}
              className={`p-3 rounded-xl border text-xs ${
                isCurrent
                  ? 'bg-amber-400/15 border-amber-400 text-white'
                  : isPassed
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-mono text-[11px] font-bold">
                CẤP {rk.rankIndex + 1} · x{rk.payMultiplier}
              </div>
              <div className="font-bold text-sm mt-0.5 text-white">
                {rk.title}
              </div>
              <div className="text-[11px] mt-1 font-mono">
                Lương cứng: +{formatCompactVND(rk.dailyBaseSalary)}/ngày
              </div>
            </div>
          );
        })}
      </div>

      {/* Các Khóa Học & Chứng Chỉ Nghiệp Vụ */}
      <div>
        <h3 className="text-sm font-bold text-white mb-2.5">
          Học Bằng Cấp & Chứng Chỉ Nghiệp Vụ (Tăng EXP & Mở Khóa Thăng Chức Quản Lý)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TRAINING_COURSES_DATA.map((course) => {
            const completed = player.completedCourseIds.includes(course.id);
            const canAfford =
              player.cash >= course.cost && player.energy >= course.energyCost;
            return (
              <div
                key={course.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  completed
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-amber-300">
                      {course.institution}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {completed ? '[ĐÃ TỐT NGHIỆP]' : formatVND(course.cost)}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {course.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {course.description}
                  </p>
                  <div className="text-[11px] font-mono text-slate-300 mt-2">
                    Nhận: +{course.expBonus} EXP · +{course.reputationBonus} Uy
                    tín · Tốn {course.energyCost} Thể lực
                  </div>
                </div>

                <button
                  type="button"
                  disabled={completed || !canAfford}
                  onClick={() => onTakeTrainingCourse(course)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    completed
                      ? 'bg-emerald-800/30 text-emerald-300 cursor-default'
                      : 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white disabled:opacity-40'
                  }`}
                >
                  {completed
                    ? 'Đã Có Chứng Chỉ Này'
                    : `Đăng Ký Học (${formatCompactVND(course.cost)})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface InvestmentExchangePanelProps {
  player: PlayerState;
  onBuyInvestment: (channel: InvestmentChannel, units: number) => void;
  onSellInvestment: (channel: InvestmentChannel, units: number) => void;
}

export const InvestmentExchangePanel: React.FC<InvestmentExchangePanelProps> = ({
  player,
  onBuyInvestment,
  onSellInvestment,
}) => {
  const totalPortfolioValue = player.portfolio.reduce((sum, item) => {
    const ch = INVESTMENT_CHANNELS_DATA.find((c) => c.id === item.channelId);
    const curPrice =
      player.marketPrices[item.channelId] || ch?.baseUnitPrice || 0;
    return sum + curPrice * item.units;
  }, 0);

  const totalDailyDividend = player.portfolio.reduce((sum, item) => {
    const ch = INVESTMENT_CHANNELS_DATA.find((c) => c.id === item.channelId);
    const curPrice =
      player.marketPrices[item.channelId] || ch?.baseUnitPrice || 0;
    return sum + Math.round(curPrice * item.units * (ch?.dailyDividendRate || 0));
  }, 0);

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/95 p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="text-xs font-medium text-emerald-400">
            Sàn Giao Dịch Đầu Tư Thời Gian Thực (Chứng Khoán · Vàng SJC · Chuỗi Nhượng Quyền · Đất Nền · Crypto)
          </div>
          <h2 className="text-xl font-display font-bold text-white mt-0.5">
            Danh Mục Đầu Tư Sinh Lời Như Ngoài Đời
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Giá thị trường biến động liên tục theo thời gian thực và mỗi ngày mới. Nắm giữ cổ phiếu, vàng và chuỗi cà phê giúp bạn nhận cổ tức tiền mặt tự động!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400">
              Tổng Giá Trị Danh Mục
            </div>
            <div className="text-base font-mono font-bold text-amber-300">
              {formatVND(totalPortfolioValue)}
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
            <div className="text-[11px] text-slate-400">
              Cổ Tức & Lợi Tức / Ngày
            </div>
            <div className="text-base font-mono font-bold text-emerald-400">
              +{formatVND(totalDailyDividend)}/ngày
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {INVESTMENT_CHANNELS_DATA.map((ch) => {
          const currentPrice =
            player.marketPrices[ch.id] || ch.baseUnitPrice;
          const changePct =
            ((currentPrice - ch.baseUnitPrice) / ch.baseUnitPrice) * 100;
          const holding = player.portfolio.find((p) => p.channelId === ch.id);
          const ownedUnits = holding ? holding.units : 0;
          const avgBuy = holding ? holding.avgBuyPrice : currentPrice;
          const unrealizedPnL =
            ownedUnits > 0 ? (currentPrice - avgBuy) * ownedUnits : 0;

          return (
            <div
              key={ch.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono font-bold text-xs">
                    {ch.code} · {ch.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">
                    {ch.riskLabel}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-bold text-white">{ch.name}</h3>
                  <div className="text-right font-mono shrink-0">
                    <div className="text-base font-bold text-amber-300">
                      {formatVND(currentPrice)}/lô
                    </div>
                    <div
                      className={`text-[11px] font-bold ${
                        changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {changePct >= 0 ? '+' : ''}
                      {changePct.toFixed(1)}% so với mệnh giá gốc
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400">{ch.description}</p>

                {ownedUnits > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div>
                      Đang giữ:{' '}
                      <strong className="text-white">{ownedUnits} lô</strong> (Giá
                      vốn TB: {formatCompactVND(avgBuy)})
                    </div>
                    <div
                      className={
                        unrealizedPnL >= 0
                          ? 'text-emerald-400 font-bold'
                          : 'text-rose-400 font-bold'
                      }
                    >
                      Tạm tính: {unrealizedPnL >= 0 ? '+' : ''}
                      {formatVND(unrealizedPnL)}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={player.cash < currentPrice}
                  onClick={() => onBuyInvestment(ch, 1)}
                  className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Mua 1 Lô
                </button>
                <button
                  type="button"
                  disabled={player.cash < currentPrice * 5}
                  onClick={() => onBuyInvestment(ch, 5)}
                  className="py-2 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Mua 5 Lô
                </button>
                <button
                  type="button"
                  disabled={ownedUnits < 1}
                  onClick={() => onSellInvestment(ch, 1)}
                  className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bán 1 Lô
                </button>
                <button
                  type="button"
                  disabled={ownedUnits < 1}
                  onClick={() => onSellInvestment(ch, ownedUnits)}
                  className="py-2 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Chốt Hết ({ownedUnits})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RedBookMortgagePanelProps {
  player: PlayerState;
  onMortgageRedBook: (
    mode: 'BANK_MORTGAGE_40M' | 'PAWNSHOP_HOT_60M' | 'VIP_SHARK_120M'
  ) => void;
  onRedeemHomeRedBook: (amount: number) => void;
}

export const RedBookMortgagePanel: React.FC<RedBookMortgagePanelProps> = ({
  player,
  onMortgageRedBook,
  onRedeemHomeRedBook,
}) => {
  const ownedLand = player.assets.find(
    (a) => a.assetId === 'dat_nen_vung_ven'
  );
  const ownedTownhouse = player.assets.find(
    (a) => a.assetId === 'nha_pho_mat_tien'
  );

  return (
    <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-br from-rose-950/35 via-slate-900 to-slate-950 p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-rose-500/30 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-bold mb-1">
            GIẤY CHỨNG NHẬN QUYỀN SỬ DỤNG ĐẤT (SỔ ĐỎ)
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Bàn Cắm Sổ Đỏ & Thế Chấp Đất Đai Giải Ngân Nóng
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Khi cần vốn lớn để tất tay đầu tư, gỡ gạc trên chiếu bạc hoặc xoay vòng nợ, bạn có thể mang Sổ Đỏ đi thế chấp ngân hàng hoặc cắm nóng tại hiệu cầm đồ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-rose-500/40">
            <div className="text-[11px] text-slate-400">
              Dư Nợ Sổ Đỏ Đất Tổ Quê Nhà
            </div>
            <div className="text-base font-mono font-bold text-rose-400">
              {formatVND(player.story.familyDebtRemaining)}
            </div>
          </div>
          {player.story.familyDebtRemaining > 0 && (
            <button
              type="button"
              disabled={player.cash < 5_000_000}
              onClick={() =>
                onRedeemHomeRedBook(
                  Math.min(player.cash, player.story.familyDebtRemaining)
                )
              }
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Chuộc Bớt Sổ Đỏ Quê (
              {formatCompactVND(
                Math.min(player.cash, player.story.familyDebtRemaining)
              )}
              )
            </button>
          )}
        </div>
      </div>

      {/* 3 Gói Cắm Sổ Đỏ Giải Ngân Ngay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-sky-400 font-bold">NGÂN HÀNG THẾ CHẤP</span>
              <span className="text-amber-300">Lãi 1.5%/ngày</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Thế Chấp Sổ Đỏ Gia Đình Vay 40 Triệu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ký hồ sơ thế chấp một phần giá trị Sổ Đỏ đất quê tại ngân hàng. Giải ngân trực tiếp 40.000.000 ₫ tiền mặt, cộng thêm 40 triệu vào dư nợ ngân hàng (Yêu cầu Uy tín CIC ≥ 45).
            </p>
          </div>
          <button
            type="button"
            disabled={player.reputation < 45}
            onClick={() => onMortgageRedBook('BANK_MORTGAGE_40M')}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Cắm Ngân Hàng Nhận +40.000.000 ₫
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-300 font-bold">TIỆM CẦM ĐỒ PHỐ CỔ</span>
              <span className="text-rose-400">Không xét CIC</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Cắm Nóng Sổ Đỏ Quê Lấy Ngay 60 Triệu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ký giấy tay ủy quyền Sổ Đỏ đất hương hỏa cho chủ tiệm cầm đồ. Nhận ngay 60.000.000 ₫ tiền tươi nhưng khoản nợ Sổ Đỏ quê nhà tăng thêm 75.000.000 ₫ (Cắt phế 15 triệu) và -15 Tinh thần.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onMortgageRedBook('PAWNSHOP_HOT_60M')}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Cắm Sổ Đỏ Lấy Nóng +60.000.000 ₫
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/50 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold">TÍN DỤNG ĐEN VIP</span>
              <span className="text-rose-300">Rủi ro mất đất</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Cắm Đứt Sổ Đỏ Cho Lão Hạc Lấy 120 Triệu
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dành cho con bạc khát nước hoặc lúc cần vốn khủng: Nhận ngay 120.000.000 ₫ tiền mặt, nợ Sổ Đỏ quê nhà tăng thêm 160.000.000 ₫, bố mẹ ở quê suy sụp (-25 Tinh thần, -10 Uy tín).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onMortgageRedBook('VIP_SHARK_120M')}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Liều Lĩnh Cắm Sổ Đỏ +120.000.000 ₫
          </button>
        </div>
      </div>

      {/* Trạng thái Sổ Đỏ Bất Động Sản Thành Phố */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-slate-300">
          <strong className="text-amber-300">Sổ Đỏ BĐS Thành Phố Đang Sở Hữu:</strong>{' '}
          {ownedLand || ownedTownhouse ? (
            <span>
              {ownedLand
                ? `Sổ Đỏ Đất Nền Vùng Ven (${
                    ownedLand.isPawned ? 'Đang cắm ở tiệm cầm đồ' : 'Đang giữ bản gốc'
                  })`
                : ''}{' '}
              {ownedTownhouse
                ? `· Sổ Đỏ Nhà Phố Mặt Tiền (${
                    ownedTownhouse.isPawned ? 'Đang cắm ở tiệm cầm đồ' : 'Đang giữ bản gốc'
                  })`
                : ''}
            </span>
          ) : (
            <span>
              Bạn chưa mua Đất Nền (85Tr) hoặc Nhà Phố Mặt Tiền (250Tr) tại mục Tổ Ấm & Tài Sản.
            </span>
          )}
        </div>
        <span className="font-mono text-slate-400">
          Có thể cắm/chuộc Sổ Đỏ BĐS riêng tại mục Tổ Ấm & Tài Sản (75% giá trị)
        </span>
      </div>
    </div>
  );
};

