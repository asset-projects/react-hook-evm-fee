import { useEffect, useReducer } from 'react';
import { type BigNumber, ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';
import { initialState, reducer } from '../helpers/reducer';
import { getProvider } from '../helpers/getProvider';
import { getFeeData } from '../helpers/getFeeData';
import { getGasUsedRatio } from '../helpers/getGasUsedRatio';
import { calculateNextBaseFeePerGas } from '../helpers/calculateNextBaseFeePerGas';

export const useFeeSuggestion = (args?: ComplexProviderArgs) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const provider = getProvider(args);

    let network: ethers.providers.Network;
    if (provider) {
      // get network info
      (async () => {
        network = await provider.getNetwork();
      })();

      // subscribe to new blocks
      provider.on('block', async (block: number) => {
        const suggestMap = new Map<string, BigNumber>();
        const latestBlockMap = new Map<string, BigNumber | number>();

        await Promise.all([
          (async () => {
            const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData(provider);
            if (maxFeePerGas) suggestMap.set('maxFeePerGas', maxFeePerGas);
            if (maxPriorityFeePerGas) suggestMap.set('maxPriorityFeePerGas', maxPriorityFeePerGas);
          })(),
          (async () => {
            const { gasUsedRatio, baseFeePerGas } = await getGasUsedRatio(provider, block);
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
          type: 'SET_STATE',
          payload: {
            suggestion: {
              baseFeePerGas:
                suggestMap.get('baseFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
              maxPriorityFeePerGas:
                suggestMap.get('maxPriorityFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
              maxFeePerGas: suggestMap.get('maxFeePerGas') || ethers.utils.parseUnits('0', 'gwei'),
            },
            latestBlock: {
              blockNumber: block,
              baseFeePerGas:
                (latestBlockMap.get('baseFeePerGas') as BigNumber) ||
                ethers.utils.parseUnits('0', 'gwei'),
              gasUsedRatio: (latestBlockMap.get('gasUsedRatio') as number) || 0,
            },
            network,
          },
        });
      });
    } else {
      dispatch({
        type: 'CREATE_ERROR',
        payload: { error: 'An error occurred when calling the provider' },
      });
    }

    return () => {
      provider && provider.off('block');
    };
  }, []);

  return {
    ...state,
  };
};
