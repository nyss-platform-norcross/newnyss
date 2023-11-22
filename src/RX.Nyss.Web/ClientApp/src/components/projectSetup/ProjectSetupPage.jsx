import React, { useState } from 'react';
import { connect } from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import { Loading } from '../common/loading/Loading';
import * as projectSetupActions from './logic/projectSetupActions';
import { useMount } from '../../utils/lifecycle';
import { SetupStepper } from '../common/stepper/SetupStepper'
import Typography from '@material-ui/core/Typography';
import { ProjectSetupName } from './ProjectSetupName'


const ProjectSetupPageComponent = ({nationalSocietyId, isFetching, openProjectSetup, setProjectName, setOrganizationId, setAlertNotHandledNotificationRecipient, setHealthRisks, setNewRegions, ...props}) => {

  useMount(() => {
    openProjectSetup(nationalSocietyId);
  });

  const [error, setError] = useState(false);
  const [isNextStepInvalid, setIsNextStepInvalid] = useState(true);

  if (isFetching) {
    return <Loading />;
  }

  const projectSetupSteps = [
    {
      name: 'Project name',
      content: <ProjectSetupName />,
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
      <SetupStepper steps={projectSetupSteps} error={error} setError={setError} isNextStepInvalid={isNextStepInvalid} setIsNextStepInvalid={setIsNextStepInvalid}/>
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
  setOrganizationId: projectSetupActions.setOrganizationId,
  setAlertNotHandledNotificationRecipientId: projectSetupActions.setAlertNotHandledNotificationRecipientId,
  setHealthRisks: projectSetupActions.setHealthRisks,
  setNewRegions: projectSetupActions.setNewRegions,
};

export const ProjectSetupPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectSetupPageComponent)
);
