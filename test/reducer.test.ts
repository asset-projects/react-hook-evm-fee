import { useReducer } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { reducer, initialState } from '../src/handlers/reducers/evmFee';

const networkValue = {
  name: 'mainnet',
  chainId: 1,
};

const latestBlockValue = {
  blockNumber: 100,
  baseFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
  gasUsedRatio: 0.5,
};

const suggestionValue = {
  baseFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
  maxPriorityFeePerGas: ethers.utils.parseUnits('1.5', 'gwei'),
  maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
};

const provider = ethers.getDefaultProvider();

export const useTest = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reset = () => {
    dispatch({ type: 'RESTORE' });
  };

  const setState = () => {
    dispatch({
      type: 'RESET_PROVIDER',
      payload: {
        network: networkValue,
        provider: provider,
      },
    });
  };

  const subscribe = () => {
    dispatch({ type: 'SUBSCRIBE' });
  };

  const unsubscribe = () => {
    dispatch({ type: 'UNSUBSCRIBE' });
  };

  const setBlock = () => {
    dispatch({
      type: 'NEW_BLOCK',
      payload: {
        suggestion: suggestionValue,
        latestBlock: latestBlockValue,
      },
    });
  };

  const exception = () => {
    dispatch({ type: 'EXCEPTION' as any });
  };

  const setFillUpList = () => {
    for (let i = 0; i <= 20; i++) {
      dispatch({
        type: 'NEW_BLOCK',
        payload: {
          suggestion: suggestionValue,
          latestBlock: latestBlockValue,
        },
      });
    }
  };

  const setError = (bool?: boolean) => {
    dispatch({
      type: 'CREATE_ERROR',
      payload: {
        error: 'error',
        cleanup: bool,
      },
    });
  };

  return {
    state,
    reset,
    setState,
    subscribe,
    unsubscribe,
    setBlock,
    setFillUpList,
    setError,
    exception,
  };
};

describe('should use evmFee reducer', () => {
  it('should use dispatch RESET_PROVIDER', () => {
    const { result } = renderHook(() => useTest());
    const { setState } = result.current;

    act(() => {
      setState();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toStrictEqual(networkValue);
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('should use dispatch SUBSCRIBE', () => {
    const { result } = renderHook(() => useTest());
    const { setState, subscribe } = result.current;

    act(() => {
      setState();
    });

    act(() => {
      subscribe();
    });

    expect(result.current.state.subscribe).toBe(true);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toStrictEqual(networkValue);
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('should use dispatch UNSUBSCRIBE', () => {
    const { result } = renderHook(() => useTest());
    const { setState, subscribe, unsubscribe } = result.current;

    act(() => {
      setState();
    });

    act(() => {
      subscribe();
    });

    act(() => {
      unsubscribe();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toStrictEqual(networkValue);
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeUndefined();
  });

  it('should use dispatch NEW_BLOCK', () => {
    const { result } = renderHook(() => useTest());
    const { setState, setBlock, setFillUpList } = result.current;

    act(() => {
      setState();
    });

    act(() => {
      setBlock();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toStrictEqual(networkValue);
    expect(result.current.state.data?.suggestion).toStrictEqual(suggestionValue);
    expect(result.current.state.data?.latestBlock).toStrictEqual(latestBlockValue);
    expect(result.current.state.data?.history).toHaveLength(0);
    expect(result.current.state.error).toBeUndefined();

    act(() => {
      setFillUpList();
    });

    expect(result.current.state.data?.history).toHaveLength(20);

    act(() => {
      setBlock();
    });

    expect(result.current.state.data?.history).toHaveLength(20);
  });

  it('should use dispatch CREATE_ERROR', () => {
    const { result } = renderHook(() => useTest());
    const { reset, setState, subscribe, setError } = result.current;

    act(() => {
      setState();
    });

    act(() => {
      subscribe();
    });

    act(() => {
      setError(true);
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeUndefined();
    expect(result.current.state.network).toBeUndefined();
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeDefined();

    act(() => {
      reset();
    });

    act(() => {
      setState();
    });

    act(() => {
      setError();
    });

    expect(result.current.state.subscribe).toBe(false);
    expect(result.current.state.provider).toBeDefined();
    expect(result.current.state.network).toStrictEqual(networkValue);
    expect(result.current.state.data).toBeUndefined();
    expect(result.current.state.error).toBeDefined();
  });
});
