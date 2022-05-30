import { ethers } from 'ethers';
import { useEVMFeeListener } from 'use-evm-fee';

const JSON_RPC_URI = process.env.REACT_APP_JSON_RPC_URI ?? '';

export const GasPrice: React.FC = () => {
  const { subscribe, data } = useEVMFeeListener({ url: JSON_RPC_URI });

  console.log('render Component');

  if (!subscribe) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  const { latestBlock, suggestion } = data;

  return (
    <div className="w-60 md:w-80 pt-10 pb-10 ml-auto mr-auto">
      <h1 className="text-3xl font-bold">Gas Price</h1>

      <div className="pt-4">
        <h2 className="text-xl font-bold">latest block</h2>
        <p>
          Block number: {latestBlock.blockNumber} (
          <a
            className="text-blue-500"
            href={`https://etherscan.io/block/${latestBlock.blockNumber}`}
            target="_blank"
            rel="noreferrer"
          >
            etherscan
          </a>
          )
        </p>
        <p>Base fee per gas: {ethers.utils.formatUnits(latestBlock.baseFeePerGas, 'gwei')} gwei</p>
        <p>Gas used ratio: {latestBlock.gasUsedRatio}</p>
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-bold">Suggestion</h2>
        <p>Base fee per gas: {ethers.utils.formatUnits(suggestion.baseFeePerGas, 'gwei')} gwei</p>
        <p>
          Max priority fee per gas:{' '}
          {ethers.utils.formatUnits(suggestion.maxPriorityFeePerGas, 'gwei')} gwei
        </p>
        <p>Max fee per gas: {ethers.utils.formatUnits(suggestion.maxFeePerGas, 'gwei')} gwei</p>
      </div>
    </div>
  );
};
