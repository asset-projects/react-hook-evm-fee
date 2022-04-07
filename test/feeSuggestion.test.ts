import { renderHook } from '@testing-library/react-hooks';
import { useFeeSuggestion } from '../src';

describe('useFeeSuggestion', () => {
  // let result: RenderHookResult<ethers.providers.Networkish | undefined, typeof useFeeSuggestion>;

  // beforeEach(() => {
  //   result = renderHook(() => useFeeSuggestion()).result;
  // });

  it('should be confirm first restore state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFeeSuggestion());

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('result suggestion data', async () => {
    const { result, waitForValueToChange } = renderHook(() => useFeeSuggestion());

    await waitForValueToChange(() => result.current.isLoading, { timeout: 30000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.network).toBeDefined();
    expect(result.current.data?.history).toHaveLength(0);

    await waitForValueToChange(() => result.current.data?.suggestion, { timeout: 30000 });
    expect(result.current.data?.suggestion.baseFeePerGas).toBeDefined();
    expect(result.current.data?.history).toHaveLength(1);
  }, 60000);

  it('wrong network name', async () => {
    const { result, waitForValueToChange } = renderHook(() => useFeeSuggestion('super-network'));

    await waitForValueToChange(() => result.current.isLoading, { timeout: 10000 });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.network).toBeUndefined();
  });
});
