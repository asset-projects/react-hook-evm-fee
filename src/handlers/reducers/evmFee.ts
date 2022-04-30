import { type Reducer } from 'react';
import { type BigNumber } from 'ethers';
import type { Network, Provider } from '../../types/provider';

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

export const initialState = {
  subscribe: false,
};

export const reducer: Reducer<State, Action> = (state, action) => {
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
        state.subscribe && state.provider && state.provider.off('block');

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
