import { Reducer, useCallback, useEffect, useReducer } from 'react';
import { type BigNumber, ethers } from 'ethers';
import type { Network, Provider } from '../types/provider';
import type { ComplexProviderArgs } from '../types/arguments';
import { getProvider } from '../helpers/getProvider';
import { getFeeData } from '../helpers/getFeeData';
import { getGasUsedRatio } from '../helpers/getGasUsedRatio';
import { calculateNextBaseFeePerGas } from '../helpers/calculateNextBaseFeePerGas';

type Args = {
  debug: boolean;
};

export const useEVMFee = (args?: Args) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    return () => {
      if (state.provider) {
        args?.debug && console.log('cleanup', 'unsubscribe');
        state.provider.removeAllListeners();
      }
    };
  }, [args?.debug, state.provider]);

  const initProvider = useCallback(
    async (networkArgs?: ComplexProviderArgs) => {
      const newProvider = getProvider(networkArgs);
      if (!newProvider) {
        args?.debug && console.log('initProvider', 'no provider');
        return dispatch({
          type: 'CREATE_ERROR',
          payload: { error: 'Failed to connect to network. args value is wrong' },
        });
      }

      const newNetwork = newProvider.network ?? (await newProvider.getNetwork());

      // When the provider does not exist
      if (!state.provider) {
        args?.debug && console.log('initProvider', 'new provider (first)');
        return dispatch({
          type: 'RESET_PROVIDER',
          payload: { provider: newProvider, network: newNetwork },
        });
      }

      if (newNetwork.chainId === state.network?.chainId) {
        args?.debug && console.log('initProvider', 'same network');
        return dispatch({
          type: 'CREATE_ERROR',
          payload: {
            error:
              'The network received in args is the same as the previous one, so it is not updated',
          },
        });
      }

      if (state.provider.listenerCount('block') > 0) {
        args?.debug && console.log('initProvider', 'remove listener');
        state.provider.off('block');
      }

      args?.debug && console.log('initProvider', 'new provider (update)');
      return dispatch({
        type: 'RESET_PROVIDER',
        payload: { provider: newProvider, network: newNetwork },
      });
    },
    [args?.debug, state.provider, state.network],
  );

  const subscribe = useCallback(() => {
    const provider = state.provider;
    if (!provider) return;
    if (state.subscribe) return;

    args?.debug && console.log('start subscribe');
    dispatch({ type: 'SUBSCRIBE' });

    provider.on('block', async (blockNumber: number) => {
      args?.debug && console.log('Block Arrival', blockNumber);

      const suggestMap = new Map<string, BigNumber>();
      const latestBlockMap = new Map<string, BigNumber | number>();

      await Promise.all([
        (async () => {
          const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(provider);
          if (maxFeePerGas) suggestMap.set('maxFeePerGas', maxFeePerGas);
          if (maxPriorityFeePerGas) suggestMap.set('maxPriorityFeePerGas', maxPriorityFeePerGas);
        })(),
        (async () => {
          const { gasUsedRatio, baseFeePerGas } = await getGasUsedRatio(provider, blockNumber);
          latestBlockMap.set('gasUsedRatio', gasUsedRatio);

          if (baseFeePerGas) {
            latestBlockMap.set('baseFeePerGas', baseFeePerGas);
            const nextBaseFeePerGas = calculateNextBaseFeePerGas(
              Number(ethers.utils.formatUnits(baseFeePerGas, 'gwei')),
              gasUsedRatio,
            );

            suggestMap.set('baseFeePerGas', nextBaseFeePerGas);
          }
        })(),
      ]);

      dispatch({
        type: 'NEW_BLOCK',
        payload: {
          suggestion: {
            baseFeePerGas: suggestMap.get('baseFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas:
              suggestMap.get('maxPriorityFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
            maxFeePerGas: suggestMap.get('maxFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
          },
          latestBlock: {
            blockNumber,
            baseFeePerGas:
              (latestBlockMap.get('baseFeePerGas') as BigNumber) ||
              ethers.utils.parseUnits('0', 'gwei'),
            gasUsedRatio: (latestBlockMap.get('gasUsedRatio') as number) || 0,
          },
        },
      });
    });
  }, [args?.debug, state.subscribe, state.provider]);

  const unsubscribe = useCallback(() => {
    if (!state.provider) return;

    args?.debug && console.log('unsubscribe');
    dispatch({ type: 'UNSUBSCRIBE' });
    state.provider.off('block');
  }, [args?.debug, state.provider]);

  const reset = useCallback(() => {
    if (!state.provider) return;

    args?.debug && console.log('resetState');
    if (state.provider.listenerCount('block') > 0) {
      state.provider.off('block');
    }

    dispatch({ type: 'RESTORE' });
  }, [args?.debug, state.provider]);

  return {
    state,
    initProvider,
    subscribe,
    unsubscribe,
    reset,
  };
};

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

type Error = any;

export type State = {
  subscribe: boolean;
  provider?: Provider;
  network?: Network;
  data?: {
    suggestion: Suggestion;
    latestBlock: Block;
    history: History;
  };
  error?: Error;
};

type Action =
  | {
      type: 'RESTORE';
    }
  | {
      type: 'RESET_PROVIDER';
      payload: Required<Omit<State, 'subscribe' | 'data' | 'error'>>;
    }
  | {
      type: 'SUBSCRIBE';
    }
  | {
      type: 'UNSUBSCRIBE';
    }
  | {
      type: 'NEW_BLOCK';
      payload: {
        suggestion: Suggestion;
        latestBlock: Block;
      };
    }
  | {
      type: 'CREATE_ERROR';
      payload: {
        error: Error;
        cleanup?: boolean;
      };
    };

const initialState = {
  subscribe: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'RESTORE':
      return { ...initialState };
    case 'RESET_PROVIDER':
      return {
        subscribe: false,
        data: undefined,
        error: undefined,
        ...action.payload,
      };
    case 'SUBSCRIBE':
      return { ...state, subscribe: true };
    case 'UNSUBSCRIBE':
      return { ...state, subscribe: false, data: undefined, error: undefined };
    case 'NEW_BLOCK':
      return {
        ...state,
        error: undefined,
        data: {
          ...action.payload,
          history:
            'data' in state && state.data
              ? state.data.history.length
                ? (() => {
                    const list = [state.data.latestBlock, ...state.data.history];
                    if (list.length > 20) {
                      list.pop();
                    }
                    return list;
                  })()
                : [state.data.latestBlock]
              : [],
        },
      };
    case 'CREATE_ERROR':
      if (action.payload.cleanup) {
        if (state.subscribe && state.provider) {
          state.provider.off('block');
        }

        return {
          ...initialState,
          error: action.payload.error,
        };
      }

      return {
        ...state,
        error: action.payload.error,
      };
  }
};
