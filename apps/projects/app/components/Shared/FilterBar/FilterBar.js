import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Button,
  Card,
  Checkbox,
  ContextMenuItem,
  GU,
  IconSearch,
  IconCheck,
  Popover,
  Text,
  TextInput,
  useLayout,
  useTheme,
} from '@aragon/ui'
import { FilterDropDown, OverflowDropDown } from './FilterDropDown'
import {
  OptionsProjects,
  OptionsLabels,
  OptionsMilestones,
  OptionsStatuses,
} from './FiltersOptions'
import ActiveFilters from '../../Content/Filters'
import prepareFilters from './prepareFilters'
import { IconArrow as IconArrowDown } from '../../../../../../shared/ui'
import { IconSort, IconGrid, IconCoins, IconFilter } from '../../../assets'
import { usePanelManagement } from '../../Panel'
import Label from '../../Content/IssueDetail/Label'
import { issueShape } from '../../../utils/shapes.js'

const sorters = [
  'Name ascending',
  'Name descending',
  'Newest',
  'Oldest',
]

const TextFilterInput = ({ textFilter, updateTextFilter }) => {
  const theme = useTheme()

  return (
    <TextInput
      placeholder="Search"
      type="search"
      onChange={updateTextFilter}
      value={textFilter}
      adornment={
        <IconSearch
          css={`
            color: ${theme.surfaceOpened};
            margin-right: ${GU}px;
          `}
        />
      }
      adornmentPosition="start"
      css="width: 228px"
    />
  )
}

TextFilterInput.propTypes = {
  textFilter: PropTypes.string.isRequired,
  updateTextFilter: PropTypes.func.isRequired,
}

const TextFilterPopover = ({ visible, opener, setVisible, textFilter, updateTextFilter }) => (
  <Popover
    visible={visible}
    opener={opener}
    onClose={() => setVisible(false)}
    css={`padding: ${1.5 * GU}px`}
    placement="bottom-end"
  >
    <TextFilterInput
      textFilter={textFilter}
      updateTextFilter={updateTextFilter}
    />
  </Popover>
)

TextFilterPopover.propTypes = {
  visible: PropTypes.bool.isRequired,
  opener: PropTypes.object,
  setVisible: PropTypes.func.isRequired,
  textFilter: PropTypes.string.isRequired,
  updateTextFilter: PropTypes.func.isRequired,
}

const TextFilter = ({ visible, setVisible, openerRef, onClick, textFilter, updateTextFilter }) => {
  const { layoutName } = useLayout()

  if (layoutName === 'large') return (
    <TextFilterInput
      textFilter={textFilter}
      updateTextFilter={updateTextFilter}
    />
  )
  return [
    <Button key="tf1" icon={<IconSearch />} display="icon" onClick={onClick} ref={openerRef} label="Text Filter" />,
    <TextFilterPopover
      key="tf2"
      visible={visible}
      opener={openerRef.current}
      setVisible={setVisible}
      textFilter={textFilter}
      updateTextFilter={updateTextFilter}
    />
  ]
}
TextFilter.propTypes = {
  visible: PropTypes.bool.isRequired,
  openerRef: PropTypes.object,
  setVisible: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  textFilter: PropTypes.string.isRequired,
  updateTextFilter: PropTypes.func.isRequired,
}

const SortPopover = ({ visible, opener, setVisible, sortBy, updateSortBy }) => {
  const theme = useTheme()

  return (
    <Popover
      visible={visible}
      opener={opener}
      onClose={() => setVisible(false)}
      css={`padding: ${1.5 * GU}px`}
      placement="bottom-end"
    >
      <Label text="Sort by" />
      {sorters.map(way => (
        <FilterMenuItem
          key={way}
          onClick={updateSortBy(way)}
        >
          <div css={`width: ${3 * GU}px`}>
            {way === sortBy && <IconCheck color={`${theme.accent}`} />}
          </div>
          <ActionLabel>{way}</ActionLabel>
        </FilterMenuItem>
      ))}
    </Popover>
  )
}
SortPopover.propTypes = {
  visible: PropTypes.bool.isRequired,
  opener: PropTypes.object,
  setVisible: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  updateSortBy: PropTypes.func.isRequired,
}

const ActionsPopover = ({ visible, setVisible, openerRef, selectedIssues, issuesFiltered, deselectAllIssues }) => {
  const { curateIssues, allocateBounty } = usePanelManagement()

  return (
    <Popover
      visible={visible}
      opener={openerRef.current}
      onClose={() => setVisible(false)}
      placement="bottom-end"
      css={`
        display: flex;
        flex-direction: column;
        padding: 10px;
      `}
    >
      <FilterMenuItem
        onClick={() => {
          curateIssues(selectedIssues, issuesFiltered)
          deselectAllIssues()
          setVisible(false)
        }}
      >
        <IconFilter />
        <ActionLabel>Curate Issues</ActionLabel>
      </FilterMenuItem>
      <FilterMenuItem
        onClick={() => {
          allocateBounty(selectedIssues)
          deselectAllIssues()
          setVisible(false)
        }}
      >
        <IconCoins />
        <ActionLabel>Fund Issues</ActionLabel>
      </FilterMenuItem>
    </Popover>
  )
}
ActionsPopover.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  openerRef: PropTypes.object.isRequired,
  selectedIssues: PropTypes.arrayOf(issueShape).isRequired,
  issuesFiltered: PropTypes.arrayOf(issueShape).isRequired,
  deselectAllIssues: PropTypes.func.isRequired,
}

const Actions = ({ onClick, openerRef, visible, setVisible, selectedIssues, issuesFiltered, deselectAllIssues }) => {
  const { layoutName } = useLayout()

  if (!selectedIssues.length) return null

  return (
    <React.Fragment>
      {layoutName === 'large' ? (
        <Button onClick={onClick} ref={openerRef}>
          <IconGrid />
          <Text css="margin: 0 8px;">Actions</Text>
          <IconArrowDown />
        </Button>
      ) : (
        <Button
          onClick={onClick}
          ref={openerRef}
          icon={<IconGrid />}
          display="icon"
          label="Actions Menu"
        />
      )}
      <ActionsPopover
        openerRef={openerRef}
        onClick={onClick}
        selectedIssues={selectedIssues}
        issuesFiltered={issuesFiltered}
        visible={visible}
        setVisible={setVisible}
        deselectAllIssues={deselectAllIssues}
      />
    </React.Fragment>
  )
}
Actions.propTypes = {
  onClick: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
  openerRef: PropTypes.object.isRequired,
  selectedIssues: PropTypes.arrayOf(issueShape).isRequired,
  issuesFiltered: PropTypes.arrayOf(issueShape).isRequired,
  deselectAllIssues: PropTypes.func.isRequired,
}

const Overflow = ({ children, filtersDisplayNumber }) => {
  const childrenArray = React.Children.toArray(children)
  const elements = childrenArray.slice(0, filtersDisplayNumber)

  if (childrenArray.length > filtersDisplayNumber) {
    elements.push(
      <OverflowDropDown key="overflow" type="overflow">
        {childrenArray.slice(filtersDisplayNumber)}
      </OverflowDropDown>
    )
  }
  return elements
}
Overflow.propTypes = {
  children: PropTypes.array.isRequired,
  filtersDisplayNumber: PropTypes.number.isRequired,
}

const FilterBar = ({
  allSelected,
  filters,
  bountyIssues,
  issues,
  issuesFiltered,
  handleSelectAll,
  handleFiltering,
  handleSorting,
  setParentFilters,
  disableFilter,
  disableAllFilters,
  deselectAllIssues,
  selectedIssues,
  onSearchChange,
}) => {

  // Complete list of sorters for DropDown. Parent has only one item, to perform actual sorting.
  const [ sortBy, setSortBy ] = useState('Newest')
  const [ textFilter, setTextFilter ] = useState('')
  const [ sortMenuVisible, setSortMenuVisible ] = useState(false)
  const [ actionsMenuVisible, setActionsMenuVisible ] = useState(false)
  const [ textFilterVisible, setTextFilterVisible ] = useState(false)
  const [ filtersDisplayNumber, setFiltersDisplayNumber ] = useState(10)
  const actionsOpener = useRef(null)
  const sortersOpener = useRef(null)
  const textFilterOpener = useRef(null)
  const mainFBRef = useRef(null)
  const rightFBRef = useRef(null)
  const activeFilters = () => {
    let count = 0
    const types = [ 'projects', 'labels', 'milestones', 'statuses' ]
    types.forEach(t => count += Object.keys(filters[t]).length)
    return count
  }

  const recalculateFiltersDisplayNumber = useCallback(() => {
    const total = mainFBRef.current ? mainFBRef.current.offsetWidth : 0
    const right = rightFBRef.current ? rightFBRef.current.offsetWidth : 0
    // 80px is "selectAll" checkbox + padding, etc
    // width is calculated from total width of main FB div and right FB div
    // (containing actions, text filter and sorters)
    const width = total - right - 80
    setFiltersDisplayNumber(Math.floor(width / (128+8)))
  }, [])

  useEffect(() => {
    window.addEventListener('resize', recalculateFiltersDisplayNumber)
    return () => {
      window.removeEventListener('resize', recalculateFiltersDisplayNumber)
    }
  }, [])

  const updateTextFilter = e => {
    setTextFilter(e.target.value)
    onSearchChange(e)
  }

  const filter = (type, id) => () => {
    if (id in filters[type]) delete filters[type][id]
    else filters[type][id] = true
    // filters are in local state because of checkboxes
    // and sent to the parent (Issues) for actual display change
    setParentFilters({ filters })
    handleFiltering(filters)
  }

  const updateSortBy = way => () => {
    handleSorting(way)
    setSortBy(way)
    setSortMenuVisible(false)
  }

  // filters contain information about active filters (checked checkboxes)
  // filtersData is about displayed checkboxes
  const allFundedIssues = [ 'funded', 'review-applicants', 'in-progress', 'review-work', 'fulfilled' ]
  const allIssues = [ 'all-funded', 'not-funded' ]
  const filtersData = prepareFilters(issues, bountyIssues)

  const actionsClickHandler = () =>
    selectedIssues.length && setActionsMenuVisible(true)

  const activateTextFilter = () => setTextFilterVisible(true)
  const activateSort = () => setSortMenuVisible(true)

  return (
    <FilterBarCard>
      <FilterBarMain ref={mainFBRef}>
        <FilterBarMainLeft>
          <SelectAll>
            <Checkbox onChange={handleSelectAll} checked={allSelected} />
          </SelectAll>

          <Overflow filtersDisplayNumber={filtersDisplayNumber}>
            <FilterDropDown caption="Projects" enabled={false}>
              <OptionsProjects onClick={filter} filters={filters} projects={filtersData.projects} />
            </FilterDropDown>
            <FilterDropDown caption="Labels" enabled={Object.keys(filtersData.labels).length > 0}>
              <OptionsLabels onClick={filter} filters={filters} labels={filtersData.labels} />
            </FilterDropDown>
            <FilterDropDown caption="Milestones" enabled={Object.keys(filtersData.milestones).length > 0}>
              <OptionsMilestones onClick={filter} filters={filters} milestones={filtersData.milestones} />
            </FilterDropDown>
            <FilterDropDown caption="Status" enabled={Object.keys(filtersData.statuses).length > 0}>
              <OptionsStatuses
                onClick={filter}
                filters={filters}
                statuses={filtersData.statuses}
                allFundedIssues={allFundedIssues}
                allIssues={allIssues}
              />
            </FilterDropDown>
          </Overflow>

        </FilterBarMainLeft>

        <FilterBarMainRight ref={rightFBRef}>
          <TextFilter
            onClick={activateTextFilter}
            textFilter={textFilter}
            updateTextFilter={updateTextFilter}
            visible={textFilterVisible}
            openerRef={textFilterOpener}
            setVisible={setTextFilterVisible}
          />

          <Button icon={<IconSort />} display="icon" onClick={activateSort} ref={sortersOpener} label="Sorters" />
          <SortPopover
            visible={sortMenuVisible}
            opener={sortersOpener.current}
            setVisible={setSortMenuVisible}
            sortBy={sortBy}
            updateSortBy={updateSortBy}
          />

          <Actions
            onClick={actionsClickHandler}
            visible={actionsMenuVisible}
            setVisible={setActionsMenuVisible}
            openerRef={actionsOpener}
            selectedIssues={selectedIssues}
            issuesFiltered={issuesFiltered}
            deselectAllIssues={deselectAllIssues}
          />

        </FilterBarMainRight>
      </FilterBarMain>

      {activeFilters() > 0 && (
        <FilterBarActives>
          <ActiveFilters
            issues={issues}
            bountyIssues={bountyIssues}
            filters={filters}
            disableFilter={disableFilter}
            disableAllFilters={disableAllFilters}
          />
        </FilterBarActives>
      )}

    </FilterBarCard>
  )
}

FilterBar.propTypes = {
  allSelected: PropTypes.bool.isRequired,
  filters: PropTypes.object.isRequired,
  bountyIssues: PropTypes.arrayOf(issueShape).isRequired,
  issues: PropTypes.arrayOf(issueShape).isRequired,
  issuesFiltered: PropTypes.arrayOf(issueShape).isRequired,
  sortBy: PropTypes.string.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  handleFiltering: PropTypes.func.isRequired,
  handleSorting: PropTypes.func.isRequired,
  setParentFilters: PropTypes.func.isRequired,
  disableFilter: PropTypes.func.isRequired,
  disableAllFilters: PropTypes.func.isRequired,
  selectedIssues: PropTypes.arrayOf(issueShape).isRequired,
  onSearchChange: PropTypes.func.isRequired,
  deselectAllIssues: PropTypes.func.isRequired,
}

const FilterMenuItem = styled(ContextMenuItem)`
  display: flex;
  align-items: center;
  padding: 5px;
  padding-right: 10px;
`
const SelectAll = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4px 12px 4px 4px;
`
const ActionLabel = styled.span`
  margin-left: 8px;
`

const FilterBarCard = styled(Card)`
  width: 100%;
  height: auto;
  padding: 12px;
  margin-bottom: 16px;
`
const FilterBarMain = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`
const FilterBarMainLeft = styled.div`
  width: 100%;
  display: flex;
  > * {
    margin-right: 8px;
  }
`
const FilterBarMainRight = styled.div`
  display: flex;
  > * {
    margin-left: 8px;
  }
`
const FilterBarActives = styled.div`
  margin: 0;
  margin-top: 12px;
  width: 100%;
  padding-left: 36px;
`
export default FilterBar
