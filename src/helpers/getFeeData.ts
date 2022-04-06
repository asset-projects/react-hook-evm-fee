import { ethers } from 'ethers';

type Provider =
  | ethers.providers.BaseProvider
  | ethers.providers.InfuraProvider
  | ethers.providers.JsonRpcProvider;

export const getFeeData = async (provider: Provider) => {
  const feeData = await provider.getFeeData();

  return {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    gasPrice: feeData.gasPrice,
  };
};
