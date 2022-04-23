# use-evm-fee

## Example

```tsx
import { ethers } from 'ethers';
import { useEVMFeeListener } from 'use-evm-fee';

const App: React.FC = () => {
  const { subscribe, network, data } = useEVMFeeListener();

  if (!subscribe || !data || !network) {
    return <div>loading...</div>;
  }

  const { latestBlock, suggestion, history } = data;

  return (
    <div>
      <h1>Network</h1>
      <p>network name: {network.name}</p>
      <p>chainId: {network.chainId}</p>

      <h1>Block</h1>
      <p>blockNumber: {data.latestBlock.blockNumber}</p>
      <p>{`baseFeePerGas: ${ethers.utils.formatUnits(latestBlock.baseFeePerGas, 'gwei')} gwei`}</p>
      <p>gasUsedRatio: {latestBlock.gasUsedRatio}</p>

      <div>
        <h1>Suggestion</h1>
        <p>{`baseFeePerGas: ${ethers.utils.formatUnits(suggestion.baseFeePerGas, 'gwei')} gwei`}</p>
        <p>
          {`maxPriorityFeePerGas: ${ethers.utils.formatUnits(
            suggestion.maxPriorityFeePerGas,
            'gwei',
          )} gwei`}
        </p>
        <p>{`maxFeePerGas: ${ethers.utils.formatUnits(suggestion.maxFeePerGas, 'gwei')} gwei`}</p>
      </div>

      <div>
        <h1>History</h1>
        {history.map((item, index) => (
          <div key={index}>
            <p>{JSON.stringify(item)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```
