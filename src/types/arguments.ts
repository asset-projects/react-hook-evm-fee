import type { ethers } from 'ethers';

type DefaultProviderArgs = {
  network?: ethers.providers.Networkish;
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
    apiKey: string;
  };
};

type JsonRpcProviderArgs = {
  url: string;
};

export type ComplexProviderArgs =
  | DefaultProviderArgs
  | InfuraProviderArgs
  | AlchemyProviderArgs
  | JsonRpcProviderArgs;
