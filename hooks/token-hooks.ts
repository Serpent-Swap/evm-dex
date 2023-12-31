// returns a predefined list of ERC20 tokens to be used in the app

import { useNetwork } from 'wagmi';
import { Token } from '../types/common';

export const useNativeToken = () => {
  const { chain } = useNetwork();
  let token: Token;

  switch (chain?.id) {
    case 11155111:
      token = {
        name: 'Ether',
        symbol: 'ETH',
        address: wrappedSepoliaEther.address,
        decimals: 18,
        isNative: true,
      };
      break;
    case 1440002:
    default:
      token = {
        name: 'XRP',
        symbol: 'XRP',
        address: wrappedXrpDevnet.address,
        decimals: 18,
        isNative: true,
      };
      break;
  }

  return token;
};

const wrappedSepoliaEther: Token = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  address: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  decimals: 18,
  isNative: false,
};

const wrappedXrpDevnet: Token = {
  name: 'Wrapped XRP',
  symbol: 'WXRP',
  address: '0x8049c9E3cE496b47E0fE8aa8EdAEf751cF87e07d',
  decimals: 18,
  isNative: false,
};

export const useWrappedNativeToken = () => {
  const { chain } = useNetwork();
  let token: Token;

  switch (chain?.id) {
    case 11155111:
      return wrappedSepoliaEther;
      break;
    case 1440002:
    default:
      return wrappedXrpDevnet;
      break;
  }

  return token;
};

export const useErc20Tokens = () => {
  // get current chain
  const { chain } = useNetwork();

  // predefined list of tokens by contract address (we should move this to a database in the future)
  let tokens: Token[] = [];

  switch (chain?.id) {
    case 1440002:
      tokens = xrplDevnetTokens;
      break;
    case 11155111:
      tokens = sepoliaTokens;
      break;
    default:
      tokens = [];
      break;
  }

  return tokens;
};

const xrplDevnetTokens: Token[] = [
  wrappedXrpDevnet,
  {
    name: 'USDX',
    symbol: 'USDX',
    address: '0x0c5C1D094f92eFfd9A6a9b0546b7b1B852B442a2',
    decimals: 18,
    isNative: false,
  },
];

const sepoliaTokens: Token[] = [
  wrappedSepoliaEther,
  {
    name: 'USDX',
    symbol: 'USDX',
    address: '0x71992849909a5Ed0c8Cc3928F5F5287B13d08aBA',
    decimals: 18,
    isNative: false,
  },
];
