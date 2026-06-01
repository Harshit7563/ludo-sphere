/** 1v1: 2 × entry gross pool; winner receives 90% (10% platform fee). */
export const ONE_V_ONE_COMMISSION_RATE = 10;

export function grossPrizePool(entryFee, mode) {
  const fee = Number(entryFee) || 0;
  if (fee <= 0) return 0;
  const players = mode === '2p' ? 2 : 4;
  return fee * players;
}

export function commissionRateForMode(mode, adminRate = 5) {
  return mode === '2p' ? ONE_V_ONE_COMMISSION_RATE : adminRate;
}

export function winnerPrizeAmount(grossPool, mode, adminCommissionRate = 5) {
  const gross = Number(grossPool) || 0;
  if (gross <= 0) return 0;
  const rate = commissionRateForMode(mode, adminCommissionRate);
  const commission = gross * (rate / 100);
  return Math.round((gross - commission) * 100) / 100;
}

export function winnerPrizeFromEntry(entryFee, mode, adminCommissionRate = 5) {
  return winnerPrizeAmount(grossPrizePool(entryFee, mode), mode, adminCommissionRate);
}
