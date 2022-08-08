import { parseUnits } from 'ethers/lib/utils';
import { fetchJson } from 'lib/fetchJson';
import useSWR from 'swr';
import { ExecutiveCommentsAPIResponseItem, ParsedExecutiveComments } from '../types/comments';
import { useNetwork } from 'modules/web3/hooks/useNetwork';

type UseExecutiveCommentsResponse = {
  comments: ParsedExecutiveComments[] | undefined;
  mutate: () => void;
  error: boolean;
};

export function useExecutiveComments(
  proposalAddress: string,
  refreshInterval = 0
): UseExecutiveCommentsResponse {
  const { network } = useNetwork();

  const {
    data: commentsDatas,
    mutate,
    error
  } = useSWR<ExecutiveCommentsAPIResponseItem[]>(
    `/api/comments/executive/${proposalAddress}?network=${network}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval,
      revalidateOnMount: true
    }
  );

  //convert voterWeight from strings to BigNumbers
  const commentsParsed = commentsDatas?.map(c => {
    const { comment, ...rest } = c;
    const { voterWeight } = comment;
    return {
      comment: {
        ...comment,
        voterWeight: parseUnits(voterWeight.replace(/,/g, '')) //remove commas from string before converting to BigNumber
      },
      ...rest
    };
  });

  return {
    comments: commentsParsed,
    mutate,
    error
  };
}
