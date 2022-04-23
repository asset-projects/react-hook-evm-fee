import { useEffect, useState } from 'react';
import _ from 'lodash';
import type { ComplexProviderArgs } from '../types/arguments';
import { useEVMFee } from './evmFee';

export const useEVMFeeListener = (args?: ComplexProviderArgs) => {
  const { state, initProvider, subscribe } = useEVMFee({
    debug: true,
  });

  const [isReady, setIsReady] = useState(false);
  const [prevArgs, setPrevArgs] = useState<ComplexProviderArgs>();

  useEffect(() => {
    if (!prevArgs) {
      setPrevArgs(args);
      setIsReady(true);
    } else {
      if (!_.isEqual(prevArgs, args)) {
        setPrevArgs(args);
        setIsReady(true);
      }
    }
  }, [args, prevArgs]);

  useEffect(() => {
    if (isReady) {
      (async () => {
        console.log('setup provider');
        await initProvider(args);
      })();
    }
  }, [isReady, args, initProvider]);

  useEffect(() => {
    if (isReady && !state.subscribe && state.provider && state.network) {
      setIsReady(false);
      subscribe();
    }
  }, [isReady, state.subscribe, state.provider, state.network, subscribe]);

  return {
    ...state,
  };
};
