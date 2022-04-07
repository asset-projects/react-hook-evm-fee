import type { ethers } from 'ethers';

type DefaultProviderArgs = ethers.providers.Networkish;

type JsonRpcProviderArgs = {
  url: string;
};

type InfuraProviderArgs = {
  network: ethers.providers.Networkish;
  infura: {
    projectId: string;
    projectSecret?: string;
  };
};

type AlchemyProviderArgs = {
  network: ethers.providers.Networkish;
  alchemy: {
    apiKey?: string;
  };
};

export type ComplexProviderArgs =
  | DefaultProviderArgs
  | JsonRpcProviderArgs
  | InfuraProviderArgs
  | AlchemyProviderArgs;
