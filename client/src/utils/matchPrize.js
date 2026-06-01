/** 1v1: 2 × entry gross pool; winner receives 90% (10% platform fee). */
export const ONE_V_ONE_COMMISSION_RATE = 10;

export function grossPrizePool(entryFee, mode) {
  const fee = Number(entryFee) || 0;
  if (fee <= 0) return 0;
  const players = mode === '2p' ? 2 : 4;
  return fee * players;
}

export function winnerPrizeFromEntry(entryFee, mode, adminCommissionRate = 5) {
  const gross = grossPrizePool(entryFee, mode);
  if (gross <= 0) return 0;
  const rate = mode === '2p' ? ONE_V_ONE_COMMISSION_RATE : adminCommissionRate;
  return Math.round(gross * (1 - rate / 100));
}

export function formatRupee(amount) {
  if (!amount) return 'Practice';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function format1v1Win(entryFee) {
  return formatRupee(winnerPrizeFromEntry(entryFee, '2p'));
}

export function format1v1WinDetail(entryFee) {
  if (!entryFee) return { win: 'Practice', gross: null };
  const gross = grossPrizePool(entryFee, '2p');
  const win = winnerPrizeFromEntry(entryFee, '2p');
  return {
    win: formatRupee(win),
    gross: formatRupee(gross),
  };
}
