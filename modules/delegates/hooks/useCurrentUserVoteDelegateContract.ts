import { useMemo } from 'react';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useWeb3React } from '@web3-react/core';
import { useVoteDelegateAddress } from './useVoteDelegateAddress';
import { VoteDelegate } from '../../../types/ethers-contracts';

type VoteDelegateResponse = {
  data?: VoteDelegate | undefined;
  loading: boolean;
  error?: Error;
};

export const useCurrentUserVoteDelegateContract = (): VoteDelegateResponse => {
  const { chainId, provider, account } = useWeb3React();

  const { data: contractAddress } = useVoteDelegateAddress(account);

  try {
    const contract = useMemo(
      () =>
        contractAddress
          ? getEthersContracts<VoteDelegate>(contractAddress, abi, chainId, provider, account)
          : undefined,
      [contractAddress]
    );

    return {
      data: contract,
      loading: false
    };
  } catch (e) {
    return {
      data: undefined,
      loading: false,
      error: e
    };
  }
};
