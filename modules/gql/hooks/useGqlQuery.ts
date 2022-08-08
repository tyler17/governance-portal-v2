import useSWR from 'swr';
import { useWeb3React } from '@web3-react/core';
import { gqlRequest } from '../gqlRequest';

type GqlQueryResponse = {
  data: any;
  loading: boolean;
  error?: any;
};

export const useGqlQuery = ({
  query,
  variables,
  cacheKey
}: {
  query: any;
  variables?: Record<string, string>;
  cacheKey: string;
}): GqlQueryResponse => {
  const { chainId } = useWeb3React();

  const { data, error } = useSWR(`gql-query/${chainId}/${cacheKey}`, async () => {
    return await gqlRequest({ chainId, query, variables });
  });

  return {
    data,
    loading: !data && !error,
    error
  };
};
