import React, { Fragment, useCallback } from 'react';
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import * as alertsActions from './logic/alertsActions';
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import AlertsTable from './components/AlertsTable';
import { useMount } from '../../utils/lifecycle';
import { AlertsFilters } from './components/AlertsFilters';
import TableActions from '../common/tableActions/TableActions';
import { TableActionsButton } from '../common/buttons/tableActionsButton/TableActionsButton';
import { stringKeys, strings } from '../../strings';
import { Loading } from '../common/loading/Loading';

const AlertsListPageComponent = ({
  openAlertsList,
  ...props
}) => {
  useMount(() => {
    openAlertsList(props.projectId);
  });

  const useRtlDirection = useSelector(state => state.appData.direction === 'rtl');

  const handleFilterChange = useCallback((filters) => {
    props.getList(props.projectId, 1, filters);
  }, [props.getList, props.projectId]);

  const handlePageChange = (page) => {
    props.getList(props.projectId, page, props.filters);
  }

  if (!props.filters) {
    return <Loading />;
  }

  return (
    <Fragment>

      <TableActions>
        <TableActionsButton
          onClick={() => props.export(props.projectId, props.filters)}
          variant={"outlined"}
        >
          {strings(stringKeys.alerts.list.export)}
        </TableActionsButton>
      </TableActions>

      <AlertsFilters
        filters={props.filters}
        filtersData={props.filtersData}
        locations={props.locations}
        healthRisks={props.healthRisks}
        onChange={handleFilterChange}
        rtl={useRtlDirection}
      />

      <AlertsTable
        list={props.data.data}
        goToAssessment={props.goToAssessment}
        isListFetching={props.isListFetching}
        onChangePage={handlePageChange}
        onSort={handleFilterChange}
        projectId={props.projectId}
        page={props.data.page}
        totalRows={props.data.totalRows}
        rowsPerPage={props.data.rowsPerPage}
        rtl={useRtlDirection}
      />
    </Fragment>
  );
}

AlertsListPageComponent.propTypes = {
  getList: PropTypes.func,
  isFetching: PropTypes.bool,
  list: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
  projectId: ownProps.match.params.projectId,
  data: state.alerts.listData,
  isListFetching: state.alerts.listFetching,
  isRemoving: state.alerts.listRemoving,
  filters: state.alerts.filters,
  locations: state.alerts.filtersData.locations,
  healthRisks: state.alerts.filtersData.healthRisks,
});

const mapDispatchToProps = {
  openAlertsList: alertsActions.openList.invoke,
  goToAssessment: alertsActions.goToAssessment,
  getList: alertsActions.getList.invoke,
  export: alertsActions.exportAlerts.invoke
};

export const AlertsListPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(AlertsListPageComponent)
);
