import { ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';

export const getProvider = (args?: ComplexProviderArgs) => {
  try {
    if (typeof args === 'object') {
      if ('url' in args) {
        return new ethers.providers.JsonRpcProvider(args.url);
      } else if ('infura' in args) {
        const { projectId, projectSecret } = args.infura;
        const secondArgument = projectSecret ? args.infura : projectId;
        return new ethers.providers.InfuraProvider(args.network, secondArgument);
      } else if ('alchemy' in args) {
        const { apiKey } = args.alchemy;
        return new ethers.providers.AlchemyProvider(args.network, apiKey);
      } else if ('network' in args) {
        return ethers.getDefaultProvider(args.network);
      }

      console.warn('Invalid provider arguments');
    } else if (typeof args === 'string') {
      return ethers.getDefaultProvider(args);
    } else {
      return ethers.getDefaultProvider();
    }
  } catch (e) {
    console.error(e);
    return;
  }
};
