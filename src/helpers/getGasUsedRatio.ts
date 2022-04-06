import { ethers } from 'ethers';

type Provider =
  | ethers.providers.BaseProvider
  | ethers.providers.InfuraProvider
  | ethers.providers.JsonRpcProvider;

export const getGasUsedRatio = async (provider: Provider, blockNumber: number) => {
  const blockObj = await provider.getBlock(blockNumber);

  const gasLimit = blockObj.gasLimit.toNumber();
  const gasUsed = blockObj.gasUsed.toNumber();
  const gasUsedRatio = gasUsed / gasLimit;

  return {
    baseFeePerGas: blockObj.baseFeePerGas,
    gasUsedRatio,
  };
};
