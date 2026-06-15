import { createPublicClient, defineChain, formatEther, getAddress, http, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';
import { fail } from './_json.mjs';

export const CROSS_CHAIN_ID = 612055;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const crossChain = defineChain({
  id: CROSS_CHAIN_ID,
  name: 'CROSS Chain Mainnet',
  nativeCurrency: { name: 'CROSS', symbol: 'CROSS', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.CROSS_RPC_URL || 'https://mainnet.crosstoken.io:22001/'] },
  },
  blockExplorers: {
    default: { name: 'CROSS Explorer', url: 'https://explorer.crosstoken.io/612055' },
  },
});

export function publicClient() {
  return createPublicClient({ chain: crossChain, transport: http() });
}

export async function ensureChain(client) {
  const chainId = await client.getChainId();
  if (chainId !== CROSS_CHAIN_ID) fail(`connected chainId ${chainId}, expected ${CROSS_CHAIN_ID}`);
  return chainId;
}

export function addressFromEnvOrArg(arg) {
  const raw = arg || process.env.TREASURY_ADDRESS;
  if (raw) {
    if (!isAddress(raw)) fail(`invalid treasury address ${raw}`);
    return getAddress(raw);
  }
  const pk = process.env.PRIVATE_KEY;
  if (pk) return privateKeyToAccount(pk).address;
  fail('treasury address required: pass <0xTreasury>, set TREASURY_ADDRESS, or set PRIVATE_KEY');
}

export function explorerAddress(address) {
  return `https://explorer.crosstoken.io/612055/address/${address}`;
}

export function formatCross(wei) {
  return formatEther(wei);
}

export async function nativeSnapshot(address) {
  const client = publicClient();
  const [chainId, blockNumber, nativeWei] = await Promise.all([
    ensureChain(client),
    client.getBlockNumber(),
    client.getBalance({ address }),
  ]);
  return {
    chainId,
    blockNumber: blockNumber.toString(),
    nativeWei,
    nativeCROSS: formatCross(nativeWei),
  };
}
