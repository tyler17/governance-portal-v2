import { useMemo } from 'react';
import abi from 'modules/contracts/ethers/voteDelegate.json';
import { getEthersContracts } from 'modules/web3/helpers/getEthersContracts';
import { useWeb3React } from '@web3-react/core';
import { useVoteProxyOldAddress } from './useVoteProxyOldAddress';
import { VoteProxy } from '../../../types/ethers-contracts';

type VoteDelegateResponse = {
  data?: VoteProxy | undefined;
  loading: boolean;
  error?: Error;
};

export const useCurrentUserVoteProxyOldContract = (): VoteDelegateResponse => {
  const { chainId, provider, account } = useWeb3React();

  const { data } = useVoteProxyOldAddress(account);

  try {
    const contract = useMemo(
      () =>
        data?.voteProxyAddress
          ? getEthersContracts<VoteProxy>(data?.voteProxyAddress, abi, chainId, provider, account)
          : undefined,
      [data?.voteProxyAddress]
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
