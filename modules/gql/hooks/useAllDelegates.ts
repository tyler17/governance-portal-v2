import { useWeb3React } from '@web3-react/core';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesAPIResponse } from 'modules/delegates/types';

export const useAllDelegates = (): SWRResponse<DelegatesAPIResponse> => {
  const { network } = useWeb3React();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates?network=${network}`;

  const response = useSWR<DelegatesAPIResponse>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });
  return response;
};
