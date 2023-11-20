import React from 'react';
import { connect } from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import { Loading } from '../common/loading/Loading';
import * as projectSetupActions from './logic/projectSetupActions';
import { useMount } from '../../utils/lifecycle';
import { SetupStepper } from '../common/stepper/SetupStepper'
import Typography from '@material-ui/core/Typography';


const ProjectSetupPageComponent = ({nationalSocietyId, isFetching, openProjectSetup, setProjectName, setOrganizationId, setAlertNotHandledNotificationRecipient, setHealthRisks, setNewRegions, ...props}) => {

  useMount(() => {
    openProjectSetup(nationalSocietyId);
  });

  if (isFetching) {
    return <Loading />;
  }

  const projectSetupSteps = [
    {
      name: 'Project name',
      content: <Typography>Project name content</Typography>,
      stepNumber: 0
    },
    {
      name: 'Organization',
      content: <Typography>Organization content</Typography>,
      stepNumber: 1
    },
    {
      name: 'Recipients',
      content: <Typography>Recipient content</Typography>,
      stepNumber: 2
    },
    {
      name: 'Health risks',
      content: <Typography>Health risk content</Typography>,
      stepNumber: 3
    },
    {
      name: 'Geographical structure',
      content: <Typography>Geographical content</Typography>,
      stepNumber: 4
    },
    {
      name: 'Summary',
      content: <Typography>Summary content</Typography>,
      stepNumber: 5
    },

  ]

  return (
    <div>
      <SetupStepper steps={projectSetupSteps}/>
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
  setProjectName: projectSetupActions.setProjectName,
  setOrganizationId: projectSetupActions.setOrganizationId,
  setAlertNotHandledNotificationRecipientId: projectSetupActions.setAlertNotHandledNotificationRecipientId,
  setHealthRisks: projectSetupActions.setHealthRisks,
  setNewRegions: projectSetupActions.setNewRegions,
};

export const ProjectSetupPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectSetupPageComponent)
);
