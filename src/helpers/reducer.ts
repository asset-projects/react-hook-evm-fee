import { Reducer } from 'react';
import { ethers, type BigNumber } from 'ethers';

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

type Network = ethers.providers.Network;

type Error = any;

type State =
  | {
      isLoading: true;
      data?: undefined;
      error?: undefined;
    }
  | {
      isLoading: false;
      data: {
        suggestion: Suggestion;
        latestBlock: Block;
        history: History;
        network: Network;
      };
      error?: Error;
    }
  | {
      isLoading: false;
      error: Error;
      data?: undefined;
    };

type Action =
  | {
      type: 'RESTORE';
    }
  | {
      type: 'SET_STATE';
      payload: {
        suggestion: Suggestion;
        latestBlock: Block;
        network: Network;
      };
    }
  | {
      type: 'CREATE_ERROR';
      payload: {
        error: Error;
      };
    };

export const initialState: State = {
  isLoading: true,
};

export const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'RESTORE':
      return initialState;
    case 'SET_STATE':
      return {
        isLoading: false,
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
      return {
        ...state,
        isLoading: false,
        error: 'error',
      };
    default:
      return { ...state };
  }
};
