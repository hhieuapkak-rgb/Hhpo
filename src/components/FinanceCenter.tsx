import React, { useState } from 'react';
import {
  PlayerState,
  SHARK_LOAN_PACKAGES,
  SharkLoanPackage,
  ASSETS_DATA,
} from '../types/game';
import { formatVND, formatCompactVND, sound } from '../utils/sound';
import financeImg from '../assets/images/finance_loan_scene_1790508086170.jpg';

interface FinanceCenterProps {
  player: PlayerState;
  onDepositBank: (amount: number) => void;
  onWithdrawBank: (amount: number) => void;
  onBorrowBank: (amount: number) => void;
  onRepayBank: (amount: number) => void;
  onTakeSharkLoan: (pkg: SharkLoanPackage) => void;
  onRepaySharkLoan: (index: number) => void;
  onBegSharkExtension: (index: number) => void;
  onPawnAsset: (assetId: string) => void;
  onRedeemAsset: (assetId: string) => void;
}

export const FinanceCenter: React.FC<FinanceCenterProps> = ({
  player,
  onDepositBank,
  onWithdrawBank,
  onBorrowBank,
  onRepayBank,
  onTakeSharkLoan,
  onRepaySharkLoan,
  onBegSharkExtension,
  onPawnAsset,
  onRedeemAsset,
}) => {
  const [bankInputAmount, setBankInputAmount] = useState<number>(2_000_000);
  const [loanInputAmount, setLoanInputAmount] = useState<number>(10_000_000);

  // Tính hạn mức vay ngân hàng tối đa dựa trên Uy Tín (CIC) và giá trị tài sản sở hữu
  const ownedAssetsValue = player.assets.reduce((acc, owned) => {
    const item = ASSETS_DATA.find((a) => a.id === owned.assetId);
    return acc + (item && !owned.isPawned ? item.price : 0);
  }, 0);

  const maxBankCreditLimit =
    player.reputation < 30
      ? 0
      : Math.round(player.reputation * 500_000 + ownedAssetsValue * 0.6);

  const remainingBankCredit = Math.max(0, maxBankCreditLimit - player.bankDebt);

  const totalSharkDebt = player.sharkLoans.reduce(
    (sum, l) => sum + l.principal + l.accruedInterest,
    0
  );

  return (
    <div className="space-y-8">
      {/* Minh họa Ngân Hàng vs Tiệm Cầm Đồ Bát Họ */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
        <div className="aspect-[21/7] w-full relative overflow-hidden bg-slate-950">
          <img
            src={financeImg}
            alt="Một bên là quầy giao dịch Ngân hàng hiện đại, một bên là Tiệm Cầm Đồ Bốc Bát Họ đèn neon"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-amber-300 mb-1">
                Tài Chính Chính Thống & Tín Dụng Đen Đường Phố
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                Ngân Hàng VietBank & Tiệm Cầm Đồ Anh Long
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                Gửi tiết kiệm sinh lời an toàn, vay vốn ngân hàng lãi thấp theo điểm CIC hoặc liều mình bốc bát họ giải ngân trong 30 giây.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">Điểm Tín Dụng CIC / Uy Tín</div>
                <div className="text-base font-mono font-bold text-sky-400 tabular-nums">
                  {player.reputation}/100 · {player.reputation >= 60 ? 'Hạng Tốt' : player.reputation >= 30 ? 'Đủ Điều Kiện' : 'Nợ Xấu'}
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="text-xs text-slate-400">Tổng Nợ Nặng Lãi</div>
                <div className="text-base font-mono font-bold text-rose-400 tabular-nums">
                  {formatVND(totalSharkDebt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chia 2 cột lớn: Ngân hàng chính thống (Trái) & Tín dụng đen / Cầm đồ (Phải) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT 1: NGÂN HÀNG THƯƠNG MẠI VIETBANK */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-medium text-sky-400">Ngân Hàng Chính Thống</div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              01. Ngân Hàng Thương Mại VietBank
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Lãi tiết kiệm +0.6%/ngày · Lãi vay ưu đãi 1.2%/ngày · Yêu cầu Uy Tín ≥ 30
            </p>
          </div>

          {/* Số dư tiết kiệm & Nợ ngân hàng */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">Sổ Tiết Kiệm Hiện Có</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1 tabular-nums">
                {formatVND(player.bankSavings)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Lãi tự động cộng mỗi sáng: +{formatVND(Math.round(player.bankSavings * 0.006))}/ngày
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-400">Dư Nợ Vay Ngân Hàng</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1 tabular-nums">
                {formatVND(player.bankDebt)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Hạn mức còn được vay: {formatVND(remainingBankCredit)}
              </div>
            </div>
          </div>

          {/* Khu vực Gửi / Rút Tiết Kiệm */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Giao Dịch Tiết Kiệm</span>
              <div className="flex items-center gap-1.5">
                {[500_000, 2_000_000, 10_000_000, 50_000_000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setBankInputAmount(amt);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                      bankInputAmount === amt
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {formatCompactVND(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={player.cash < bankInputAmount}
                onClick={() => onDepositBank(bankInputAmount)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Gửi {formatCompactVND(bankInputAmount)}
              </button>
              <button
                type="button"
                disabled={player.cash <= 0}
                onClick={() => onDepositBank(player.cash)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Gửi Toàn Bộ Tiền Mặt
              </button>
              <button
                type="button"
                disabled={player.bankSavings <= 0}
                onClick={() =>
                  onWithdrawBank(Math.min(player.bankSavings, bankInputAmount))
                }
                className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Rút {formatCompactVND(Math.min(player.bankSavings, bankInputAmount))}
              </button>
              <button
                type="button"
                disabled={player.bankSavings <= 0}
                onClick={() => onWithdrawBank(player.bankSavings)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Rút Hết Sổ
              </button>
            </div>
          </div>

          {/* Khu vực Vay & Trả Nợ Ngân Hàng */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                Vay Tín Chấp & Thế Chấp Ngân Hàng
              </span>
              <div className="flex items-center gap-1.5">
                {[5_000_000, 15_000_000, 30_000_000, 100_000_000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setLoanInputAmount(amt);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                      loanInputAmount === amt
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {formatCompactVND(amt)}
                  </button>
                ))}
              </div>
            </div>

            {player.reputation < 30 && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
                Điểm Uy Tín của bạn hiện dưới 30 (Nợ xấu CIC). Ngân hàng từ chối giải ngân mới cho đến khi bạn làm việc lương thiện nâng cao Uy Tín.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={
                  player.reputation < 30 ||
                  remainingBankCredit < loanInputAmount
                }
                onClick={() => onBorrowBank(loanInputAmount)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Vay Ngân Hàng {formatCompactVND(loanInputAmount)}
              </button>
              <button
                type="button"
                disabled={player.bankDebt <= 0 || player.cash <= 0}
                onClick={() =>
                  onRepayBank(Math.min(player.cash, player.bankDebt, loanInputAmount))
                }
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Trả Bớt Nợ
              </button>
              <button
                type="button"
                disabled={player.bankDebt <= 0 || player.cash < player.bankDebt}
                onClick={() => onRepayBank(player.bankDebt)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Tất Toán Hết Nợ NH
              </button>
            </div>
          </div>
        </div>

        {/* CỘT 2: TIỆM CẦM ĐỒ & BỐC BÁT HỌ (VAY NẶNG LÃI) */}
        <div className="rounded-2xl border border-rose-900/50 bg-slate-900/90 p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-medium text-rose-400">
              Tín Dụng Đen · Giải Ngân Không Cần CIC
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              02. Tiệm Cầm Đồ & Bốc Bát Họ Anh Long Rồng Đỏ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Nhận tiền mặt tức thì, cắt lãi trước ngay khi ký giấy. Cẩn thận: Trễ hạn sẽ bị đàn em đến tận phòng trọ đòi nợ!
            </p>
          </div>

          {/* Danh sách gói Bốc Bát Họ */}
          <div className="space-y-3">
            {SHARK_LOAN_PACKAGES.map((pkg) => {
              const netReceive = Math.round(
                pkg.principal * (1 - pkg.upfrontCutPercent / 100)
              );
              const alreadyHasThis = player.sharkLoans.some(
                (l) => l.packageId === pkg.id
              );

              return (
                <div
                  key={pkg.id}
                  className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <span>{pkg.name}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs font-mono text-rose-400">
                        Lãi {Math.round(pkg.dailyInterestRate * 100)}%/ngày
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{pkg.description}</p>
                    <p className="text-[11px] text-amber-300/90">
                      Thực nhận về tay: <strong className="font-mono">{formatVND(netReceive)}</strong> · Hạn trả: {pkg.durationDays} ngày
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={alreadyHasThis}
                    onClick={() => onTakeSharkLoan(pkg)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {alreadyHasThis ? 'Đang Nợ Gói Này' : `Bốc Bát Họ (+${formatCompactVND(netReceive)})`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Các khoản Bát Họ đang nợ */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white">
              Sổ Đen Bát Họ Đang Gánh ({player.sharkLoans.length} khoản)
            </h3>

            {player.sharkLoans.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                Bạn hiện không nợ đồng nào của xã hội đen. Cuộc sống bình yên!
              </div>
            ) : (
              player.sharkLoans.map((loan, idx) => {
                const totalPayoff = loan.principal + loan.accruedInterest;
                const daysLeft = loan.dueDay - player.day;
                const isOverdue = daysLeft < 0;

                return (
                  <div
                    key={loan.packageId}
                    className={`rounded-xl p-4 border space-y-3 ${
                      isOverdue
                        ? 'bg-rose-950/50 border-rose-500'
                        : 'bg-slate-950 border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{loan.name}</div>
                        <div className="text-xs text-slate-400">
                          Chủ nợ: {loan.lenderName} · Ngày đáo hạn: Ngày {loan.dueDay}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          isOverdue ? 'text-rose-400' : 'text-amber-300'
                        }`}
                      >
                        {isOverdue
                          ? `Quá hạn ${Math.abs(daysLeft)} ngày!`
                          : `Còn ${daysLeft} ngày`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono bg-slate-900/90 p-2.5 rounded-lg">
                      <span>Gốc: {formatCompactVND(loan.principal)}</span>
                      <span>·</span>
                      <span className="text-rose-400">
                        Lãi cộng dồn: +{formatCompactVND(loan.accruedInterest)}
                      </span>
                      <span>·</span>
                      <span className="text-white font-bold">
                        Tổng trả: {formatVND(totalPayoff)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={player.cash < totalPayoff}
                        onClick={() => onRepaySharkLoan(idx)}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Tất Toán ({formatCompactVND(totalPayoff)})
                      </button>
                      <button
                        type="button"
                        disabled={player.cash < Math.round(loan.principal * 0.15)}
                        onClick={() => onBegSharkExtension(idx)}
                        className="py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Đóng Phế Khất Nợ +3 Ngày ({formatCompactVND(Math.round(loan.principal * 0.15))})
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Khu vực Cầm Đồ Tài Sản */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-display font-bold text-white">
              03. Quầy Cầm Cố Tài Sản (Lấy Tiền Mặt Tức Thì Bằng 75% Giá Trị)
            </h2>
            <p className="text-xs text-slate-400">
              Khi cháy túi ở chiếu bạc, bạn có thể cắm Xe Wave, SH, Vàng SJC hay Sổ Đỏ tại tiệm Anh Long và chuộc lại sau (phí chuộc +10%).
            </p>
          </div>
        </div>

        {player.assets.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Bạn chưa sở hữu tài sản nào (Xe máy, Laptop, Vàng, Bất động sản). Hãy qua mục &ldquo;Phòng Trọ & Tài Sản&rdquo; để mua sắm khi có tiền!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {player.assets.map((owned) => {
              const item = ASSETS_DATA.find((a) => a.id === owned.assetId);
              if (!item) return null;
              const redeemCost = Math.round(item.pawnValue * 1.1);

              return (
                <div
                  key={owned.assetId}
                  className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{item.name}</span>
                      <span
                        className={`text-xs font-mono ${
                          owned.isPawned ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {owned.isPawned ? 'Đang Cầm Cố' : 'Đang Sử Dụng'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Giá gốc: {formatCompactVND(item.price)} · Giá cầm: {formatCompactVND(item.pawnValue)}
                    </div>
                  </div>

                  {!owned.isPawned ? (
                    <button
                      type="button"
                      onClick={() => onPawnAsset(item.id)}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cầm Đồ Nhận Ngay +{formatCompactVND(item.pawnValue)}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={player.cash < redeemCost}
                      onClick={() => onRedeemAsset(item.id)}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Chuộc Lại Tài Sản ({formatCompactVND(redeemCost)})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
