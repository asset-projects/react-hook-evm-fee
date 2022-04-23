import 'dotenv/config';
import { act, renderHook } from '@testing-library/react-hooks';
import { useEVMFeeListener } from '../src';

let rpcUrl: string;

beforeAll(() => {
  rpcUrl = process.env.JSON_RPC_URL ?? 'http://localhost:8545';
});

describe('useEVMFee', () => {
  it('start subscribe', async () => {
    const { result, unmount, rerender } = renderHook(() => useEVMFeeListener());

    rerender();

    expect(result.current.subscribe).toBe(true);
    expect(result.current.provider).toBeDefined();
    expect(result.current.network).toBeDefined();

    act(() => unmount());
  }, 10000);

  it('Arrival of the latest block', async () => {
    const { result, waitForValueToChange, unmount, rerender } = renderHook(() =>
      useEVMFeeListener(),
    );

    rerender();

    await waitForValueToChange(() => result.current.data, { timeout: 10000 });
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.suggestion).toBeDefined();
    expect(result.current.data?.latestBlock).toBeDefined();
    expect(result.current.data?.history).toBeDefined();

    unmount();
  });
});
