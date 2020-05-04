import React, { Fragment } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as organizationsActions from './logic/organizationsActions';
import { useLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import AddIcon from '@material-ui/icons/Add';
import TableActions from '../common/tableActions/TableActions';
import OrganizationsTable from './OrganizationsTable';
import { useMount } from '../../utils/lifecycle';
import { strings, stringKeys } from '../../strings';
import { TableActionsButton } from '../common/tableActions/TableActionsButton';

const OrganizationsListPageComponent = (props) => {
  useMount(() => {
    props.openOrganizationsList(props.nationalSocietyId);
  });

  return (
    <Fragment>
      {!props.nationalSocietyIsArchived &&
      <TableActions>
        <TableActionsButton onClick={() => props.goToCreation(props.nationalSocietyId)} icon={<AddIcon />}>
          {strings(stringKeys.organization.addNew)}
        </TableActionsButton>
      </TableActions>}

      <OrganizationsTable
        list={props.list}
        goToEdition={props.goToEdition}
        goToDashboard={props.goToDashboard}
        isListFetching={props.isListFetching}
        isRemoving={props.isRemoving}
        remove={props.remove}
        nationalSocietyId={props.nationalSocietyId}
      />
    </Fragment>
  );
}

OrganizationsListPageComponent.propTypes = {
  getOrganizations: PropTypes.func,
  goToCreation: PropTypes.func,
  goToEdition: PropTypes.func,
  remove: PropTypes.func,
  isFetching: PropTypes.bool,
  list: PropTypes.array
};

const mapStateToProps = (state, ownProps) => ({
  nationalSocietyId: ownProps.match.params.nationalSocietyId,
  list: state.organizations.listData,
  isListFetching: state.organizations.listFetching,
  isRemoving: state.organizations.listRemoving,
  nationalSocietyIsArchived: state.appData.siteMap.parameters.nationalSocietyIsArchived
});

const mapDispatchToProps = {
  openOrganizationsList: organizationsActions.openList.invoke,
  goToCreation: organizationsActions.goToCreation,
  goToEdition: organizationsActions.goToEdition,
  remove: organizationsActions.remove.invoke
};

export const OrganizationsListPage = useLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(OrganizationsListPageComponent)
);
