import 'dotenv/config';
import { act, renderHook, RenderHookResult } from '@testing-library/react-hooks';
import { useEVMFee } from '../src';

let rpcUrl: string;

beforeAll(() => {
  rpcUrl = process.env.JSON_RPC_URL ?? 'http://localhost:8545';
});

describe('useEVMFee', () => {
  let hook: RenderHookResult<{ debug: boolean }, ReturnType<typeof useEVMFee>>;

  beforeEach(() => {
    hook = renderHook(() => useEVMFee({ debug: true }));
  });

  it('should be confirm first state', () => {
    const { result } = hook;

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeUndefined();
    expect(result.current.state.network).toBeUndefined();
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('Test initProvider()', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toBeDefined();
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('Test initProvider(). Run again and set another network', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toBeDefined();

    await act(async () => {
      await result.current.initProvider({ network: 'ropsten' });
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network?.chainId).toBe(3);
  });

  it('Test initProvider(). Run again and set same network', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toBeDefined();
    expect(result.current.state.error).toBeUndefined();

    await act(async () => {
      await result.current.initProvider({ url: rpcUrl });
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network?.chainId).toBe(1);
    expect(result.current.state.error).toBeDefined();
  });

  it('Test initProvider(). Set non-existent network', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider('super network');
    });

    expect(result.current.state.error).toBeDefined();
  });

  it('Test initProvider(). Set network not present during execution', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    expect(result.current.state.error).toBeUndefined();

    await act(async () => {
      await result.current.initProvider('super network');
    });

    expect(result.current.state.error).toBeDefined();
  });

  test('Test subscribe()', async () => {
    const { result, waitForValueToChange, unmount } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toBeDefined();

    act(() => {
      result.current.subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);

    await waitForValueToChange(() => result.current.state, { timeout: 30000 });

    expect(result.current.state.data).toBeDefined();
    expect(result.current.state.error).toBeUndefined();
    expect(result.current.state.data?.history).toHaveLength(0);

    await waitForValueToChange(() => result.current.state.data?.suggestion, { timeout: 50000 });
    expect(result.current.state.data?.history).toHaveLength(1);

    await waitForValueToChange(() => result.current.state.data?.suggestion, { timeout: 50000 });
    expect(result.current.state.data?.history).toHaveLength(2);

    act(() => {
      unmount();
    });
  }, 130000);

  test('Test unsubscribe()', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    act(() => {
      result.current.subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);

    act(() => {
      result.current.unsubscribe();
    });

    expect(result.current.state.subscribe).toBe(false);
  });

  test('Initialize provider during subscribe', async () => {
    const { result } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    act(() => {
      result.current.subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);

    await act(async () => {
      await result.current.initProvider({ network: 'ropsten' });
    });

    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network?.chainId).toBe(3);
  });

  test('Test reset()', async () => {
    const { result, waitForValueToChange, unmount } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    act(() => {
      result.current.subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);

    await waitForValueToChange(() => result.current.state, { timeout: 30000 });

    expect(result.current.state.data).toBeDefined();
    expect(result.current.state.error).toBeUndefined();
    expect(result.current.state.data?.history).toHaveLength(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeUndefined();
    expect(result.current.state.network).toBeUndefined();
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();

    act(() => {
      unmount();
    });
  }, 60000);

  test('Unmount during subscribe', async () => {
    const { result, unmount } = hook;

    await act(async () => {
      await result.current.initProvider();
    });

    act(() => {
      result.current.subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);

    const provider = result.current.state.provider;

    act(() => {
      unmount();
    });

    expect(provider?.listenerCount('block')).toBe(0);
  });
});
