import { ethers } from 'ethers';
import { calculateNextBaseFeePerGas } from '../src/helpers/calculateNextBaseFeePerGas';

describe('calculateNextBaseFeePerGas', () => {
  const baseFeePerGas = 10; // gwei

  it('should return the next base fee per gas when fill rate is 0%', () => {
    const gasUsedRatio = 0;
    const nextBaseFeePerGas = calculateNextBaseFeePerGas(baseFeePerGas, gasUsedRatio);
    expect(Number(ethers.utils.formatUnits(nextBaseFeePerGas, 'gwei').toString())).toBe(
      baseFeePerGas * 0.875,
    );
  });

  it('should return the next base fee per gas when fill rate is 50%', () => {
    const gasUsedRatio = 0.5;
    const nextBaseFeePerGas = calculateNextBaseFeePerGas(baseFeePerGas, gasUsedRatio);
    expect(Number(ethers.utils.formatUnits(nextBaseFeePerGas, 'gwei').toString())).toEqual(
      baseFeePerGas,
    );
  });

  it('should return the next base fee per gas when fill rate is 100%', () => {
    const gasUsedRatio = 1;
    const nextBaseFeePerGas = calculateNextBaseFeePerGas(baseFeePerGas, gasUsedRatio);
    expect(Number(ethers.utils.formatUnits(nextBaseFeePerGas, 'gwei').toString())).toBe(
      baseFeePerGas * 1.125,
    );
  });

  it('should return the next base fee per gas when fill rate is 30%', () => {
    const gasUsedRatio = 0.3;
    const nextBaseFeePerGas = calculateNextBaseFeePerGas(baseFeePerGas, gasUsedRatio);
    expect(Number(ethers.utils.formatUnits(nextBaseFeePerGas, 'gwei').toString())).toBeLessThan(
      baseFeePerGas,
    );
  });

  it('should return the next base fee per gas when fill rate is 80%', () => {
    const gasUsedRatio = 0.8;
    const nextBaseFeePerGas = calculateNextBaseFeePerGas(baseFeePerGas, gasUsedRatio);
    expect(Number(ethers.utils.formatUnits(nextBaseFeePerGas, 'gwei').toString())).toBeGreaterThan(
      baseFeePerGas,
    );
  });
});
