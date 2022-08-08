import { fetchJson } from 'lib/fetchJson';
import useSWR from 'swr';
import { PollCommentsAPIResponseItem } from '../types/comments';
import { useWeb3React } from '@web3-react/core';

type UsePollCommentsResponse = {
  comments: PollCommentsAPIResponseItem[] | undefined;
  mutate: () => void;
  error?: Error;
};

export function usePollComments(pollId: number, refreshInterval = 0): UsePollCommentsResponse {
  const { network } = useWeb3React();

  const {
    data: commentsDatas,
    error,
    mutate
  } = useSWR<PollCommentsAPIResponseItem[]>(`/api/comments/polling/${pollId}?network=${network}`, fetchJson, {
    revalidateOnFocus: false,
    refreshInterval,
    revalidateOnMount: true
  });

  return {
    comments: commentsDatas,
    mutate,
    error
  };
}
