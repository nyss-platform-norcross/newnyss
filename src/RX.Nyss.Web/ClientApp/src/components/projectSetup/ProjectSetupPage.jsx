import React from 'react';
import { connect } from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import { Loading } from '../common/loading/Loading';
import * as projectSetupActions from './logic/projectSetupActions';
import { useMount } from '../../utils/lifecycle';


const ProjectSetupPageComponent = ({nationalSocietyId, openProjectSetup, isFetching, ...props}) => {

  useMount(() => {
    openProjectSetup(nationalSocietyId);
  });

  if (isFetching) {
    return <Loading />;
  }

  return (
    <div>
      <h2>Setup-form goes here</h2>
    </div>
  );
}

ProjectSetupPageComponent.propTypes = {
};

const mapStateToProps = (state, ownProps) => ({
  nationalSocietyId: ownProps.match.params.nationalSocietyId,
  isFetching: state.projectSetup.formFetching,
});

const mapDispatchToProps = {
  openProjectSetup: projectSetupActions.openSetup.invoke,
};

export const ProjectSetupPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectSetupPageComponent)
);
