# use-evm-fee

## Example

```tsx
import { ethers } from 'ethers';
import { useFeeSuggestion } from '@asset-projects/use-evm-fee';

const App: React.VFC = () => {
  const { isLoading, data, error } = useFeeSuggestion();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!data || error) {
    return <p>Error</p>;
  }

  const { suggestion, latestBlock, history, network } = data;

  return (
    <div>
      <div>
        <h1>Network</h1>
        <p>network name: {network.name}</p>
        <p>chainId: {network.chainId}</p>

        <h1>Block</h1>
        <p>blockNumber: {latestBlock.blockNumber}</p>
        <p>
          {`baseFeePerGas: ${ethers.utils.formatUnits(latestBlock.baseFeePerGas, 'gwei')} gwei`}
        </p>
        <p>gasUsedRatio: {latestBlock.gasUsedRatio}</p>
      </div>

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
