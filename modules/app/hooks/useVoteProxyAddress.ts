import useSWR from 'swr';
import { useContracts } from 'modules/web3/hooks/useContracts';
import { getVoteProxyAddresses, VoteProxyAddresses } from '../helpers/getVoteProxyAddresses';
import { useWeb3React } from '@web3-react/core';

type VoteProxyAddressResponse = {
  data?: VoteProxyAddresses;
  loading: boolean;
  error: Error;
};

export const useVoteProxyAddress = (account?: string): VoteProxyAddressResponse => {
  const { voteProxyFactory } = useContracts();
  const { network } = useWeb3React();

  const { data, error } = useSWR(account ? `${account}/vote-proxy-address` : null, async () => {
    return await getVoteProxyAddresses(voteProxyFactory, account as string, network);
  });

  return {
    data,
    loading: !error && !data,
    error
  };
};
