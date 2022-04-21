import type { ethers } from 'ethers';

export type Provider =
  | ethers.providers.JsonRpcProvider
  | ethers.providers.InfuraProvider
  | ethers.providers.AlchemyProvider
  | ethers.providers.BaseProvider;

export type Network = ethers.providers.Network;
