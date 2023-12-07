import React, { useState } from "react";
import { connect } from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';
import { Loading } from '../common/loading/Loading';
import * as projectSetupActions from './logic/projectSetupActions';
import * as projectActions from '../projects/logic/projectsActions';
import { useMount } from '../../utils/lifecycle';
import { SetupStepper } from '../common/stepper/SetupStepper'
import Typography from '@material-ui/core/Typography';
import { ProjectSetupGeographicalStructure } from "./ProjectSetupGeographicalStructure"
import { ProjectSetupOrganization } from './ProjectSetupOrganization';
import { ProjectSetupName } from './ProjectSetupName'
import { strings, stringKeys } from '../../strings';
import { ProjectSetupSummary } from './ProjectSetupSummary'
import { ProjectSetupRecipients } from './ProjectSetupRecipients';


const ProjectSetupPageComponent = ({
  nationalSocietyId,
  isFetching,
  openProjectSetup,
  goToList,
  ...props
}) => {
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
      name: strings(stringKeys.projectSetup.projectName.name),
      content: (
        <ProjectSetupName
          error={error}
          setError={setError}
          setIsNextStepInvalid={setIsNextStepInvalid}
        />
      ),
      stepNumber: 0,
    },
    {
      name: strings(stringKeys.projectSetup.projectOrganization.name),
      content: (
        <ProjectSetupOrganization
          error={error}
          setError={setError}
          setIsNextStepInvalid={setIsNextStepInvalid}
        />
      ),
      stepNumber: 1,
    },
    {
      name: strings(stringKeys.projectSetup.projectRecipients.name),
      content: <ProjectSetupRecipients error={error} setError={setError} setIsNextStepInvalid={setIsNextStepInvalid}/>,
      stepNumber: 2
    },
    {
      name: "Health risks",
      content: <Typography>Health risk content</Typography>,
      stepNumber: 5,
    },
    {
      name: strings(stringKeys.projectSetup.geographicalStructure.name),
      content: <ProjectSetupGeographicalStructure />,
      stepNumber: 4,
      isOptional: true,
    },
    {
      name: strings(stringKeys.projectSetup.summary.name),
      content: <ProjectSetupSummary />,
      stepNumber: 3
    },
  ];

  return (
    <div>
      <SetupStepper
        steps={projectSetupSteps}
        error={error}
        setError={setError}
        isNextStepInvalid={isNextStepInvalid}
        setIsNextStepInvalid={setIsNextStepInvalid}
        goToList={goToList}
        nationalSocietyId={nationalSocietyId}
      />
    </div>
  );
};

ProjectSetupPageComponent.propTypes = {};

const mapStateToProps = (state, ownProps) => ({
  nationalSocietyId: ownProps.match.params.nationalSocietyId,
  isFetching: state.projectSetup.formFetching,
});

const mapDispatchToProps = {
  openProjectSetup: projectSetupActions.openSetup.invoke,
  goToList: projectActions.goToList,
};

export const ProjectSetupPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectSetupPageComponent),
);
