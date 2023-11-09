import React, { Fragment } from 'react';
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import * as projectAlertRecipientsActions from './logic/projectAlertRecipientsActions';
import TableActions from '../common/tableActions/TableActions';
import ProjectAlertRecipientsTable from './ProjectAlertRecipientsTable';
import { useMount } from '../../utils/lifecycle';
import { strings, stringKeys } from '../../strings';
import { TableActionsButton } from '../common/buttons/tableActionsButton/TableActionsButton';
import TableHeader from '../common/tableHeader/TableHeader';

const ProjectAlertRecipientsListPageComponent = (props) => {
  useMount(() => {
    props.openProjectAlertRecipientsList(props.projectId);
  });

  const useRtlDirection = useSelector(state => state.appData.direction === 'rtl');

  return (
    <Fragment>
      <TableHeader>
        {!props.nationalSocietyIsArchived && !props.projectIsClosed &&
        <TableActions>
          <TableActionsButton
            onClick={() => props.goToCreation(props.projectId)}
            add
            variant="contained"
            rtl={useRtlDirection}
          >
            {strings(stringKeys.common.buttons.add)}
          </TableActionsButton>
        </TableActions>}
      </TableHeader>

      <ProjectAlertRecipientsTable
        list={props.list}
        isListFetching={props.isListFetching}
        isRemoving={props.isRemoving}
        goToEdition={props.goToEdition}
        remove={props.remove}
        projectId={props.projectId}
        isClosed={props.projectIsClosed}
        rtl={useRtlDirection}
      />
    </Fragment>
  );
}

ProjectAlertRecipientsListPageComponent.propTypes = {
  getProjectAlertRecipients: PropTypes.func,
  goToCreation: PropTypes.func,
  goToEdition: PropTypes.func,
  remove: PropTypes.func,
  isFetching: PropTypes.bool,
  list: PropTypes.array
};

const mapStateToProps = (state) => ({
  list: state.projectAlertRecipients.listData,
  isListFetching: state.projectAlertRecipients.listFetching,
  isRemoving: state.projectAlertRecipients.listRemoving,
  nationalSocietyIsArchived: state.appData.siteMap.parameters.nationalSocietyIsArchived,
  projectIsClosed: state.appData.siteMap.parameters.projectIsClosed
});

const mapDispatchToProps = {
  openProjectAlertRecipientsList: projectAlertRecipientsActions.openList.invoke,
  goToCreation: projectAlertRecipientsActions.goToCreation,
  goToEdition: projectAlertRecipientsActions.goToEdition,
  remove: projectAlertRecipientsActions.remove.invoke
};

export const ProjectAlertRecipientsListPage = connect(mapStateToProps, mapDispatchToProps)(ProjectAlertRecipientsListPageComponent);
