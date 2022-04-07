import { useReducer } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ethers } from 'ethers';
import { reducer, initialState } from '../src/helpers/reducer';

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

export const useTest = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const reset = () => {
    dispatch({ type: 'RESTORE' });
  };

  const setState = () => {
    dispatch({
      type: 'SET_STATE',
      payload: {
        network: networkValue,
        latestBlock: latestBlockValue,
        suggestion: suggestionValue,
      },
    });
  };

  const setFullList = () => {
    for (let i = 0; i <= 20; i++) {
      dispatch({
        type: 'SET_STATE',
        payload: {
          network: networkValue,
          latestBlock: latestBlockValue,
          suggestion: suggestionValue,
        },
      });
    }
  };

  const setError = () => {
    dispatch({
      type: 'CREATE_ERROR',
      payload: {
        error: 'error',
      },
    });
  };

  const exception = () => {
    dispatch({ type: 'EXCEPTION' as any });
  };

  return {
    state,
    reset,
    setState,
    setFullList,
    setError,
    exception,
  };
};

describe('Test reducer', () => {
  it('set action', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      result.current.setError();
    });

    expect(result.current.state.error).toBe('error');
  });

  it('exception action', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      result.current.exception();
    });

    expect(result.current.state.isLoading).toBe(true);
  });

  it('restore action', () => {
    const { result } = renderHook(() => useTest());

    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual(initialState);
  });

  it('set action full list', () => {
    const { result } = renderHook(() => useTest());
    act(() => {
      result.current.setFullList();
    });

    expect(result.current.state.data.history).toHaveLength(20);

    act(() => {
      result.current.setState();
    });

    expect(result.current.state.data.history).toHaveLength(20);
  });
});
