import dotEnv from 'dotenv';
import { ethers } from 'ethers';
import { getProvider } from '../src/helpers/getProvider';

let jsonRpcUrl;
let infuraProjectId;
let infuraProjectSecret;
let alchemyApiKey;

beforeAll(() => {
  dotEnv.config();

  jsonRpcUrl = process.env.JSON_RPC_URL;
  infuraProjectId = process.env.INFURA_PROJECT_ID;
  infuraProjectSecret = process.env.INFURA_PROJECT_SECRET;
  alchemyApiKey = process.env.ALCHEMY_API_KEY;
});

describe('getProvider', () => {
  it('non argument', async () => {
    const provider = getProvider();
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });

  it('invalid provider arguments', async () => {
    const provider = getProvider({ pretense: {} } as any);
    expect(provider).toBeUndefined();
  });

  it('set network name', async () => {
    const provider = getProvider('ropsten');
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('ropsten');
    expect(network.chainId).toBe(3);
  });

  it('set network chainId', async () => {
    const provider = getProvider(1);
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });

  it('set network with wrong network name', async () => {
    const provider = getProvider('wrong');
    expect(provider).toBeUndefined();
  });

  it('set json rpc url', async () => {
    const provider = getProvider({ url: jsonRpcUrl }) as ethers.providers.JsonRpcProvider;
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });

  it('infura provider', async () => {
    const provider = getProvider({
      network: 'homestead',
      infura: { projectId: '1708186a14364f5781f3cee6c8587b70' },
    });
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });

  it('infura provider include projectSecret', async () => {
    const provider = getProvider({
      network: 'homestead',
      infura: {
        projectId: infuraProjectId,
        projectSecret: infuraProjectSecret,
      },
    });
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });

  it('alchemy provider', async () => {
    const provider = getProvider({
      network: 'homestead',
      alchemy: { apiKey: alchemyApiKey },
    });
    expect(provider).toBeDefined();

    const network = await provider.getNetwork();
    expect(network.name).toBe('homestead');
    expect(network.chainId).toBe(1);
  });
});
