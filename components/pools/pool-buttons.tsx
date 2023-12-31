import { useEffect } from 'react';
import { useSwapProtocolAddresses } from '@/hooks/swap-protocol-hooks';
import { FeeTier, Token } from '@/types/common';
import { Button, Stack } from '@mui/material';
import { formatEther, formatUnits, parseUnits, zeroAddress } from 'viem';
import {
  erc20ABI,
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import PreviewPosition from './preview-position';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { syncTransaction } from '@/lib/actions/transactions';

type PoolButtonsProps = {
  tokenA: Token | null;
  tokenB: Token | null;
  feeTier: FeeTier;
  amountA: number;
  amountB: number;
  minPrice: number;
  maxPrice: number;
  startingPrice: number;
  currentPrice: number;
  isPoolInitialized: boolean;
  isPairReversed: boolean;
  resetAndClose: () => void;
};

const PoolButtons = ({
  tokenA,
  tokenB,
  feeTier,
  amountA,
  amountB,
  minPrice,
  maxPrice,
  startingPrice,
  currentPrice,
  isPoolInitialized,
  isPairReversed,
  resetAndClose
}: PoolButtonsProps) => {
  const { chain } = useNetwork();
  const { address: userAddress } = useAccount();
  const { nfPositionManager } = useSwapProtocolAddresses();
  const tokenAContract = {
    address: tokenA?.address ?? zeroAddress,
    abi: erc20ABI,
  };

  const tokenBContract = {
    address: tokenB?.address ?? zeroAddress,
    abi: erc20ABI,
  };

  const {
    data: allowances,
    refetch: refetchAllowances,
    isRefetching: refetchingAllowances,
  } = useContractReads({
    contracts: [
      {
        ...tokenAContract,
        functionName: 'allowance',
        args: [userAddress ?? zeroAddress, nfPositionManager],
      },
      {
        ...tokenBContract,
        functionName: 'allowance',
        args: [userAddress ?? zeroAddress, nfPositionManager],
      },
    ],
  });

  const allowanceA = (allowances?.[0].result as bigint) || 0n;
  const allowanceB = (allowances?.[1].result as bigint) || 0n;

  const isAmountAValid = !isNaN(amountA) && amountA !== -Infinity && amountA !== Infinity;
  const isAmountBValid = !isNaN(amountB) && amountB !== -Infinity && amountB !== Infinity;

  const roundedAmountA = isAmountAValid ? amountA.toFixed(tokenA?.decimals ?? 18) : '0';
  const roundedAmountB = isAmountBValid ? amountB.toFixed(tokenB?.decimals ?? 18) : '0';
  const amountAInWei = isAmountAValid ? parseUnits(roundedAmountA, tokenA?.decimals ?? 18) : 0n;
  const amountBInWei = isAmountBValid ? parseUnits(roundedAmountB, tokenA?.decimals ?? 18) : 0n;

  const { config: tokenAConfig } = usePrepareContractWrite({
    ...tokenAContract,
    functionName: 'approve',
    args: [nfPositionManager, amountAInWei],
    enabled: tokenA !== null && tokenA?.address !== zeroAddress,
  });

  const {
    data: approveTokenAResult,
    status: approveTokenAStatus,
    isLoading: isApprovingTokenA,
    isSuccess: isTokenAApproved,
    write: approveTokenA,
  } = useContractWrite(tokenAConfig);

  useEffect(() => {
    if (approveTokenAResult?.hash && chain?.id) {
      syncTransaction(chain.id, approveTokenAResult.hash, 'approve');
    }
  }, [approveTokenAResult, chain]);

  const {
    data: approveTokenATxReceipt,
    isLoading: isApproveTokenATxPending,
    isSuccess: isApproveTokenATxSuccess,
    isError: isApproveTokenATxError,
  } = useWaitForTransaction({
    hash: approveTokenAResult?.hash,
    enabled: approveTokenAResult?.hash !== undefined,
  });

  const { config: tokenBConfig } = usePrepareContractWrite({
    ...tokenBContract,
    functionName: 'approve',
    args: [nfPositionManager, amountBInWei],
    enabled: tokenB !== null && tokenB?.address !== zeroAddress,
  });

  const {
    data: approveTokenBResult,
    isLoading: isApprovingTokenB,
    isSuccess: isTokenBApproved,
    write: approveTokenB,
  } = useContractWrite(tokenBConfig);

  useEffect(() => {
    if (approveTokenBResult?.hash && chain?.id) {
      syncTransaction(chain.id, approveTokenBResult.hash, 'approve');
    }
  }, [approveTokenBResult, chain]);

  const {
    data: approveTokenBTxReceipt,
    isLoading: isApproveTokenBTxPending,
    isSuccess: isApproveTokenBTxSuccess,
    isError: isApproveTokenBTxError,
  } = useWaitForTransaction({
    hash: approveTokenBResult?.hash,
    enabled: approveTokenBResult?.hash !== undefined,
  });

  useEffect(() => {
    refetchAllowances();

    if (isApproveTokenATxSuccess)
      toast.success(`You have approved ${tokenA?.symbol} to be spent by the Swap Protocol.`);

    if (isApproveTokenBTxSuccess)
      toast.success(`You have approved ${tokenB?.symbol} to be spent by the Swap Protocol.`);
  }, [isTokenAApproved, isTokenBApproved, isApproveTokenATxSuccess, isApproveTokenBTxSuccess]);

  const canSpendTokens = tokenA !== null && tokenB !== null && allowanceA >= amountAInWei && allowanceB >= amountBInWei;

  return (
    <Stack
      direction="column"
      spacing={2}
    >
      {((tokenA !== null && allowanceA < amountAInWei) || (tokenB !== null && allowanceB < amountBInWei)) && (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="stretch"
        >
          {tokenA !== null && allowanceA < amountAInWei && (
            <LoadingButton
              variant="contained"
              size="large"
              fullWidth
              onClick={async () => {
                if (approveTokenA) await approveTokenA();
              }}
              loading={isApprovingTokenA || isApproveTokenATxPending}
              sx={{ h: 56 }}
            >
              Approve {tokenA.symbol}
            </LoadingButton>
          )}

          {tokenB !== null && allowanceB < amountBInWei && (
            <LoadingButton
              variant="contained"
              size="large"
              fullWidth
              onClick={async () => {
                if (approveTokenB) await approveTokenB();
              }}
              loading={isApprovingTokenB || isApproveTokenBTxPending}
              sx={{ h: 56 }}
            >
              Approve {tokenB.symbol}
            </LoadingButton>
          )}
        </Stack>
      )}

      <PreviewPosition
        canSpendTokens={canSpendTokens}
        tokenA={tokenA}
        tokenB={tokenB}
        feeTier={feeTier}
        amountA={amountA}
        amountB={amountB}
        minPrice={minPrice}
        maxPrice={maxPrice}
        startingPrice={startingPrice}
        currentPrice={currentPrice}
        isPoolInitialized={isPoolInitialized}
        isPairReversed={isPairReversed}
        resetAndClose={resetAndClose}
      />
    </Stack>
  );
};

export default PoolButtons;
