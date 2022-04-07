import { ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';

export const getProvider = (args?: ComplexProviderArgs) => {
  let newProvider;

  if (typeof args === 'object') {
    if ('url' in args) {
      newProvider = new ethers.providers.JsonRpcProvider(args.url);
    } else if ('infura' in args) {
      const { projectId, projectSecret } = args.infura;
      const secondArgument = projectSecret ? args.infura : projectId;
      newProvider = new ethers.providers.InfuraProvider(args.network, secondArgument);
    } else if ('alchemy' in args) {
      const { apiKey } = args.alchemy;
      newProvider = new ethers.providers.AlchemyProvider(args.network, apiKey);
    } else {
      newProvider = ethers.getDefaultProvider();
    }
  } else if (typeof args === 'string') {
    newProvider = ethers.getDefaultProvider(args);
  } else {
    newProvider = ethers.getDefaultProvider();
  }

  return newProvider;
};
