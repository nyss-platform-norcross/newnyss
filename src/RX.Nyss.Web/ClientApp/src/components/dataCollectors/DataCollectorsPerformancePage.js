import { Fragment, useReducer, useEffect, useCallback } from 'react';
import PropTypes from "prop-types";
import { connect, shallowEqual, useSelector } from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import { useMount } from '../../utils/lifecycle';
import DataCollectorsPerformanceTable from './components/DataCollectorsPerformanceTable';
import * as dataCollectorActions from './logic/dataCollectorsActions';
import { DataCollectorsPerformanceFilters } from './components/DataCollectorsPerformanceFilters';
import { DataCollectorsPerformanceTableLegend } from './components/DataCollectorsPerformanceTableLegend';
import { initialState } from '../../initialState';
import TableActions from '../common/tableActions/TableActions';
import { TableActionsButton } from '../common/buttons/tableActionsButton/TableActionsButton';
import { stringKeys, strings } from '../../strings';
import { accessMap } from '../../authentication/accessMap';

const DataCollectorsPerformancePageComponent = ({ projectId, getDataCollectorPerformanceList, ...props }) => {
  useMount(() => {
    props.openDataCollectorsPerformanceList(projectId, props.filters);
  });

  const useRtlDirection = useSelector(state => state.appData.direction === 'rtl');

  const handleFilterChange = useCallback((filters) =>
    getDataCollectorPerformanceList(projectId, filters), [getDataCollectorPerformanceList, projectId]);

  return (
    <Fragment>
      <TableActions>
        <TableActionsButton
          onClick={() => props.exportPerformance(projectId, props.filters)}
          roles={accessMap.dataCollectors.export}
          isFetching={props.isExporting}
          variant={"outlined"}
        >
          {strings(stringKeys.dataCollectors.exportExcel)}
        </TableActionsButton>
      </TableActions>

      <DataCollectorsPerformanceFilters
        onChange={handleFilterChange}
        filters={props.filters}
        rtl={useRtlDirection}
        locations={props.locations}
        supervisors={props.supervisors}
        userRoles={props.userRoles}
      />
      <DataCollectorsPerformanceTableLegend rtl={useRtlDirection} />
      <DataCollectorsPerformanceTable
        list={props.listData.data}
        completeness={props.completeness}
        epiDateRange={props.epiDateRange}
        rowsPerPage={props.listData.rowsPerPage}
        totalRows={props.listData.totalRows}
        page={props.listData.page}
        goToDashboard={props.goToDashboard}
        isListFetching={props.isListFetching}
        projectId={projectId}
        filters={props.filters}
        onChange={handleFilterChange}
        rtl={useRtlDirection}
      />
    </Fragment>
  );
}

DataCollectorsPerformancePageComponent.propTypes = {
  openDataCollectorsPerformanceList: PropTypes.func,
  isFetching: PropTypes.bool,
  list: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
  projectId: ownProps.match.params.projectId,
  nationalSocietyId: state.dataCollectors.filtersData.nationalSocietyId,
  filters: state.dataCollectors.performanceListFilters,
  listData: state.dataCollectors.performanceListData,
  completeness: state.dataCollectors.completeness,
  isListFetching: state.dataCollectors.performanceListFetching,
  epiDateRange: state.dataCollectors.epiDateRange,
  isExporting: state.dataCollectors.isExporting,
  locations: state.dataCollectors.filtersData.locations,
  supervisors: state.dataCollectors.filtersData.supervisors,
  userRoles: state.appData.user.roles,
});

const mapDispatchToProps = {
  openDataCollectorsPerformanceList: dataCollectorActions.openDataCollectorsPerformanceList.invoke,
  getDataCollectorPerformanceList: dataCollectorActions.getDataCollectorsPerformanceList.invoke,
  exportPerformance: dataCollectorActions.exportDataCollectorPerformance.invoke
};

export const DataCollectorsPerformancePage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(DataCollectorsPerformancePageComponent)
);
