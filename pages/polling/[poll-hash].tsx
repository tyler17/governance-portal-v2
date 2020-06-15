/** @jsx jsx */
import { useEffect, useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Link from 'next/link';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import invariant from 'tiny-invariant';
import { Card, Flex, Divider, Heading, Text, Progress, NavLink, Box, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import Tooltip from '@reach/tooltip';

import CountdownTimer from '../../components/CountdownTimer';
import Delay from '../../components/Delay';
import useAccountsStore from '../../stores/accounts';
import getMaker, { getNetwork, isDefaultNetwork } from '../../lib/maker';
import { getPolls, getPoll } from '../../lib/api';
import { parsePollTally, fetchJson } from '../../lib/utils';
import PrimaryLayout from '../../components/layouts/Primary';
import SidebarLayout from '../../components/layouts/Sidebar';
import Stack from '../../components/layouts/Stack';
import Tabs from '../../components/Tabs';
import VotingStatus from '../../components/polling/VotingStatus';
import Poll from '../../types/poll';
import PollVote from '../../types/pollVote';
import PollTally from '../../types/pollTally';
import Skeleton from 'react-loading-skeleton';

const PollView = ({ poll }: { poll: Poll }) => {
  const account = useAccountsStore(state => state.currentAccount);
  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address))
  );

  const network = getNetwork();
  const hasPollEnded = new Date(poll.endDate).getTime() < new Date().getTime();
  const { data: tally } = useSWR<PollTally>(
    hasPollEnded
      ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${network}`
      : `/api/polling/tally/${poll.pollId}?network=${network}`,
    async url => parsePollTally(await fetchJson(url), poll)
  );
  return (
    <PrimaryLayout shortenFooter={true}>
      <SidebarLayout>
        <div>
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Link href={{ pathname: '/polling', query: { network } }}>
              <NavLink p={2}>
                <Flex sx={{ alignItems: 'center', fontSize: [3, 4], whiteSpace: 'nowrap' }}>
                  <Icon name="chevron_left" size="2" mr={2} /> Back to all polls
                </Flex>
              </NavLink>
            </Link>
            <Flex>
              {poll.ctx.prevPollSlug && (
                <Link
                  scroll={false}
                  href={{
                    pathname: '/polling/[poll-hash]',
                    query: { network }
                  }}
                  as={{
                    pathname: `/polling/${poll.ctx.prevPollSlug}`,
                    query: { network }
                  }}
                >
                  <NavLink p={2}>
                    <Flex sx={{ alignItems: 'center', fontSize: [3, 4], whiteSpace: 'nowrap' }}>
                      <Icon name="chevron_left" size={2} mr={2} /> Previous Poll
                    </Flex>
                  </NavLink>
                </Link>
              )}
              {poll.ctx.nextPollSlug && (
                <Link
                  scroll={false}
                  href={{
                    pathname: '/polling/[poll-hash]',
                    query: { network }
                  }}
                  as={{
                    pathname: `/polling/${poll.ctx.nextPollSlug}`,
                    query: { network }
                  }}
                >
                  <NavLink p={2}>
                    <Flex sx={{ alignItems: 'center', fontSize: [3, 4], whiteSpace: 'nowrap' }}>
                      Next Poll <Icon name="chevron_right" size={2} ml={2} />
                    </Flex>
                  </NavLink>
                </Link>
              )}
            </Flex>
          </Flex>
          <Card>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text
                sx={{
                  fontSize: [2, 3],
                  color: 'mutedAlt',
                  textTransform: 'uppercase'
                }}
              >
                {new Date(poll.startDate).toLocaleString('default', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
              <Heading
                my="3"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: [5, 6]
                }}
              >
                {poll.title}
              </Heading>
              <Flex mb={3} sx={{ justifyContent: 'space-between' }}>
                <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
                <VotingStatus poll={poll} allUserVotes={allUserVotes} />
              </Flex>
            </Flex>
            <Divider />
            <Tabs
              hashRoute={true}
              tabTitles={['Poll Detail', 'Vote Breakdown']}
              tabPanels={[
                <div dangerouslySetInnerHTML={{ __html: poll.content }} />,
                <div sx={{ pt: 3 }}>
                  <Text as="h3" sx={{ pb: 2 }}>
                    Vote Breakdown
                  </Text>
                  {Object.keys(poll.options).map((_, i) => (
                    <div key={i}>
                      <Flex sx={{ justifyContent: 'space-between' }}>
                        <Text sx={{ color: 'textMuted', width: '20%' }}>
                          {tally ? (
                            tally.results[i].optionName
                          ) : (
                            <Delay>
                              <Skeleton />
                            </Delay>
                          )}
                        </Text>
                        <Text sx={{ color: 'textMuted', width: tally ? 'unset' : '30%' }}>
                          {tally ? (
                            `${tally.results[i].firstChoice
                              .add(tally.results[i].transfer)
                              .toBigNumber()
                              .toFormat(2)} MKR Voting`
                          ) : (
                            <Delay>
                              <Skeleton />
                            </Delay>
                          )}
                        </Text>
                      </Flex>

                      {tally ? (
                        <Tooltip
                          sx={{ mt: -1 }}
                          label={`First choice ${tally.results[i].firstChoice.toBigNumber().toFormat(2)}`}
                        >
                          <Box my={1} py={1}>
                            <Progress
                              max={tally.totalMkrParticipation.toBigNumber()}
                              value={tally.results[i].firstChoice.toBigNumber()}
                            />
                          </Box>
                        </Tooltip>
                      ) : (
                        <Delay>
                          <Skeleton />
                        </Delay>
                      )}
                    </div>
                  ))}
                </div>
              ]}
            />
          </Card>
        </div>
        <Flex sx={{ flexDirection: 'column' }}>
          <Stack>
            <Card variant="compact">Card 1</Card>
            <Card variant="compact">Card 2</Card>
          </Stack>
        </Flex>
      </SidebarLayout>
    </PrimaryLayout>
  );
};

export default function PollPage({ poll: prefetchedPoll }: { poll?: Poll }) {
  const [_poll, _setPoll] = useState<Poll>();
  const [error, setError] = useState<string>();
  const { query, isFallback } = useRouter();

  // fetch poll contents at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork() && query['poll-hash']) {
      getPoll(query['poll-hash'] as string)
        .then(_setPoll)
        .catch(setError);
    }
  }, [query['poll-hash']]);

  if (error || (isDefaultNetwork() && !isFallback && !prefetchedPoll?.multiHash)) {
    return (
      <ErrorPage statusCode={404} title="Poll either does not exist, or could not be fetched at this time" />
    );
  }

  if (isFallback || (!isDefaultNetwork() && !_poll))
    return (
      <PrimaryLayout shortenFooter={true}>
        <p>Loading…</p>
      </PrimaryLayout>
    );

  const poll = isDefaultNetwork() ? prefetchedPoll : _poll;
  return <PollView poll={poll as Poll} />;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // fetch poll contents at build-time if on the default network
  invariant(params?.['poll-hash'], 'getStaticProps poll hash not found in params');
  const poll = await getPoll(params['poll-hash'] as string);

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      poll
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const polls = await getPolls();
  const paths = polls.map(p => `/polling/${p.slug}`);

  return {
    paths,
    fallback: true
  };
};
