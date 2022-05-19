import { Flex, Box, Checkbox, Label, Text, ThemeUIStyleObject } from 'theme-ui';
import shallow from 'zustand/shallow';
import { Poll, PollCategory } from 'modules/polling/types';
import FilterButton from 'modules/app/components/FilterButton';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export function PollTypeFilter({
  filteredPolls,
  ...props
}: {
  categories: PollCategory[];
  filteredPolls: Poll[];
  sx?: ThemeUIStyleObject;
}): JSX.Element {
  const [pollVoteType, setPollVoteType] = useUiFiltersStore(
    state => [state.pollFilters.pollVoteType, state.setPollVoteType],
    shallow
  );

  const itemsSelected = Object.values(pollVoteType || {}).filter(i => !!i).length;

  return (
    <FilterButton
      name={() => `Type ${itemsSelected > 0 ? `(${itemsSelected})` : ''}`}
      listVariant="cards.noPadding"
      data-testid="poll-filters-dropdown"
      active={itemsSelected > 0}
      {...props}
    >
      <Box p={2} sx={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <Flex sx={{ flexDirection: 'column' }}>
          {Object.values(POLL_VOTE_TYPE).map(type => (
            <Flex key={type}>
              <Label sx={{ py: 1, fontSize: 2, alignItems: 'center' }}>
                <Checkbox
                  sx={{ width: 3, height: 3 }}
                  checked={(pollVoteType && pollVoteType[type]) || false}
                  onChange={event => {
                    setPollVoteType({ ...pollVoteType, [type]: event.target.checked });
                  }}
                />
                <Flex sx={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text>{type}</Text>
                  <Text sx={{ color: 'muted', ml: 3 }}>
                    {filteredPolls.filter(i => i.voteType.includes(type)).length}
                  </Text>
                </Flex>
              </Label>
            </Flex>
          ))}
        </Flex>
      </Box>
    </FilterButton>
  );
}
