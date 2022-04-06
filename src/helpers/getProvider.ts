import { ethers } from 'ethers';
import type { ComplexProviderArgs } from '../types/arguments';

export const getProvider = (args?: ComplexProviderArgs) => {
  let newProvider;

  if (args) {
    if ('url' in args) {
      newProvider = new ethers.providers.JsonRpcProvider(args.url);
    } else if ('infura' in args) {
      const { projectId, projectSecret } = args.infura;
      const secondArgument = projectSecret ? args.infura : projectId;
      newProvider = new ethers.providers.InfuraProvider(args.network, secondArgument);
    } else if ('alchemy' in args) {
      const { apiKey } = args.alchemy;
      newProvider = new ethers.providers.AlchemyProvider(apiKey);
    } else {
      const network = args.network || 'homestead';
      newProvider = ethers.getDefaultProvider(network);
    }
  } else {
    newProvider = ethers.getDefaultProvider();
  }

  return newProvider;
};
