import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import type { BigNumber, ethers } from 'ethers';
import type { ComplexProviderArgs } from '../src/types/arguments';
import { useFeeSuggestion } from '../src';

type Suggestion = {
  baseFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  maxFeePerGas: BigNumber;
};

type Block = {
  blockNumber: number;
  baseFeePerGas: BigNumber;
  gasUsedRatio: number;
};

type History = Block[];

describe('useFeeSuggestion', () => {
  let hook: RenderHookResult<
    ComplexProviderArgs | undefined,
    | {
        isLoading: true;
        data?: undefined;
        error?: undefined;
      }
    | {
        isLoading: false;
        data: {
          suggestion: Suggestion;
          latestBlock: Block;
          history: History;
          network: ethers.providers.Network;
        };
        error?: any;
      }
    | {
        isLoading: false;
        error: Error;
        data?: undefined;
      }
  >;

  beforeEach(() => {
    hook = renderHook(() => useFeeSuggestion());
  });

  it('should be confirm first restore state', async () => {
    const { result } = hook;

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('subscribe new block', async () => {
    const { result, waitForValueToChange, unmount } = hook;
    await waitForValueToChange(() => result.current.data, { timeout: 30000 });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toBeDefined();
    expect(result.current.data.network).toBeDefined();
    expect(result.current.data.history).toHaveLength(0);

    await waitForValueToChange(() => result.current.data, { timeout: 30000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.data.network).toBeDefined();
    expect(result.current.data.latestBlock).toBeDefined();
    expect(result.current.data.suggestion).toBeDefined();
    expect(result.current.data.history).toHaveLength(1);

    unmount();
  }, 36000);

  it('wrong network name', async () => {
    const { result, rerender } = renderHook(() => useFeeSuggestion('super-network'));

    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
