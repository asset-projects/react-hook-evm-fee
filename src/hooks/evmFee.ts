import { useCallback, useEffect, useReducer } from 'react';
import { type BigNumber, ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';
import { initialState, reducer } from '../handlers/reducers/evmFee';
import { getProvider } from '../helpers/getProvider';
import { getFeeData } from '../helpers/getFeeData';
import { getGasUsedRatio } from '../helpers/getGasUsedRatio';
import { calculateNextBaseFeePerGas } from '../helpers/calculateNextBaseFeePerGas';
import { checkSupportEIP1559 } from '../helpers/supportEip15559';

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

      const isSupportEIP1559 = checkSupportEIP1559(newNetwork.chainId);

      // When the provider does not exist
      if (!state.provider) {
        args?.debug && console.log('initProvider', 'new provider (first)');
        return dispatch({
          type: 'RESET_PROVIDER',
          payload: { provider: newProvider, network: newNetwork, isSupportEIP1559 },
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
        payload: { provider: newProvider, network: newNetwork, isSupportEIP1559 },
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
