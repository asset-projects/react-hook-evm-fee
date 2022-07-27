const supportMainNetworkChains = [1, 100, 137, 1285, 43114];
const supportTestNetworkChains = [3, 4, 5, 42, 43113, 11155111];

const supportChains = [...supportMainNetworkChains, ...supportTestNetworkChains];

export const checkSupportEIP1559 = (chainId: number): boolean => {
  return supportChains.includes(chainId);
};
