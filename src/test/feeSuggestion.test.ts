import { renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useFeeSuggestion } from '../hooks/feeSuggestion';

describe('should use feeSuggestion', () => {
  // let result: RenderHookResult<ethers.providers.Networkish | undefined, typeof useFeeSuggestion>;

  // beforeEach(() => {
  //   result = renderHook(() => useFeeSuggestion()).result;
  // });

  it('should first restore state', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFeeSuggestion());

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('shoud suggestion data', async () => {
    const { result, waitForValueToChange } = renderHook(() => useFeeSuggestion());

    await waitForValueToChange(() => result.current.isLoading, { timeout: 30000 });

    expect(result.current.data).toBeDefined();
    expect(result.current.network).toBeDefined();
    expect(result.current.data?.history).toHaveLength(0);

    await waitForValueToChange(() => result.current.data?.suggestion, { timeout: 30000 });
    expect(result.current.data?.suggestion.baseFeePerGas).toBeDefined();
    expect(result.current.data?.history).toHaveLength(1);
  }, 60000);
});
