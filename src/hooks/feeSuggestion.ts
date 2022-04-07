import { Reducer, useEffect, useReducer, useState } from 'react';
import { type BigNumber, ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';
import { getProvider } from '../helpers/getProvider';
import { getFeeData } from '../helpers/getFeeData';
import { getGasUsedRatio } from '../helpers/getGasUsedRatio';
import { calculateNextBaseFeePerGas } from '../helpers/calculateNextBaseFeePerGas';

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

type State =
  | {
      isLoading: true;
      data: undefined;
    }
  | {
      isLoading: false;
      data: {
        suggestion: Suggestion;
        latestBlock: Block;
        history: History;
      };
    };

type ActionTypes = 'RESTORE' | 'SET_DATA';

type Action = {
  type: ActionTypes;
  payload: {
    suggestion: Suggestion;
    latestBlock: Block;
  };
};

export const initialState: State = {
  isLoading: true,
  data: undefined,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'RESTORE':
      return initialState;
    case 'SET_DATA':
      return {
        isLoading: false,
        data: {
          suggestion: action.payload.suggestion,
          latestBlock: action.payload.latestBlock,
          history: state.data
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
    default:
      return { ...state };
  }
};

export const useFeeSuggestion = (args?: ComplexProviderArgs) => {
  const [networkState, setNetworkState] = useState<ethers.providers.Network>();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const provider = getProvider(args);

    if (provider) {
      // get network info
      provider.getNetwork().then((data) => setNetworkState(data));

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
          type: 'SET_DATA',
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
          },
        });
      });
    }

    return () => {
      provider && provider.off('block');
    };
  }, []);

  return {
    network: networkState,
    ...state,
  };
};
