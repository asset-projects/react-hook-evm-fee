import { ethers } from 'ethers';

export const calculateNextBaseFeePerGas = (baseFeePerGas: number, gasUsedRatio: number) => {
  const fillRateBlock = gasUsedRatio * 100;

  if (fillRateBlock <= 50) {
    const ratio = 1 - fillRateBlock / 50;
    const _next = baseFeePerGas - baseFeePerGas * 0.125 * ratio;
    return ethers.utils.parseUnits(_next.toFixed(6), 'gwei');
  } else {
    const ratio = fillRateBlock / 100;
    const _next = baseFeePerGas + baseFeePerGas * 0.125 * ratio;
    return ethers.utils.parseUnits(_next.toFixed(6), 'gwei');
  }
};
