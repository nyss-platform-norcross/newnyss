import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import * as nationalSocietiesActions from "./logic/nationalSocietiesActions";
import * as appActions from "../app/logic/appActions";
import { withLayout } from "../../utils/layout";
import Layout from "../layout/Layout";
import TableActions from "../common/tableActions/TableActions";
import NationalSocietiesTable from "./NationalSocietiesTable";
import { useMount } from "../../utils/lifecycle";
import { strings, stringKeys } from "../../strings";
import * as nationalSocietyDashboardActions from "../nationalSocietyDashboard/logic/nationalSocietyDashboardActions";
import { TableActionsButton } from "../common/buttons/tableActionsButton/TableActionsButton";

const NationalSocietiesListPageComponent = ({
  showStringsKeys,
  match,
  openModule,
  getList,
  ...props
}) => {
  useMount(() => {
    openModule(match.path, match.params);
    getList();
  });

  const userLanguageCode = useSelector(
    (state) => state.appData.user.languageCode,
  );

  return (
    <Fragment>
      <TableActions>
        <TableActionsButton
          onClick={props.goToCreation}
          add
          variant="contained"
          rtl={userLanguageCode === "ar"}
        >
          {strings(stringKeys.common.buttons.add)}
        </TableActionsButton>
      </TableActions>

      <NationalSocietiesTable
        list={props.list}
        goToEdition={props.goToEdition}
        goToDashboard={props.goToDashboard}
        isListFetching={props.isListFetching}
        archive={props.archive}
        reopen={props.reopen}
        isArchiving={props.isArchiving}
        isReopening={props.isReopening}
        rtl={userLanguageCode === "ar"}
      />
    </Fragment>
  );
};

NationalSocietiesListPageComponent.propTypes = {
  getNationalSocieties: PropTypes.func,
  goToCreation: PropTypes.func,
  goToEdition: PropTypes.func,
  archive: PropTypes.func,
  reopen: PropTypes.func,
  isFetching: PropTypes.bool,
  list: PropTypes.array,
};

const mapStateToProps = (state) => ({
  list: state.nationalSocieties.listData,
  isListFetching: state.nationalSocieties.listFetching,
  isArchiving: state.nationalSocieties.listArchiving,
  isReopening: state.nationalSocieties.listReopening,
  callingUserRoles: state.appData.user.roles,
});

const mapDispatchToProps = {
  getList: nationalSocietiesActions.getList.invoke,
  goToCreation: nationalSocietiesActions.goToCreation,
  goToEdition: nationalSocietiesActions.goToEdition,
  goToDashboard: nationalSocietyDashboardActions.goToDashboard,
  openModule: appActions.openModule.invoke,
  archive: nationalSocietiesActions.archive.invoke,
  reopen: nationalSocietiesActions.reopen.invoke,
};

export const NationalSocietiesListPage = withLayout(
  Layout,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NationalSocietiesListPageComponent),
);
