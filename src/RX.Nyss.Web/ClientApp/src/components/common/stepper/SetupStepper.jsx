import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import StepConnector from '@material-ui/core/StepConnector';
import CheckIcon from '@material-ui/icons/Check';
import { strings, stringKeys } from '../../../strings';

const useStyles = makeStyles((theme) => ({
  stepper: {
    backgroundColor: 'inherit',
  },
  step: {
    cursor: "pointer"
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
}));

const useColorlibStepIconStyles = makeStyles({
  root: {
    border: '1px solid #E3E3E3',
    zIndex: 1,
    width: 40,
    height: 40,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: {
    border: '1px solid #D52B1E',
    color: "#D52B1E",
  },
  activeText: {
    color: "#D52B1E",
    fontWeight: 700,
  },
  notCompletedText: {
    color: "#B4B4B4",
    fontWeight: 700,
  },
  completed: {
    backgroundColor: "#D52B1E",
    border: '1px solid #D52B1E',
    color: '#D52B1E',
  },
});


const Connector = withStyles({
  alternativeLabel: {
    top: 22,
  },
  active: {
    '& $line': {
      backgroundColor: "#D52B1E",
    },
  },
  completed: {
    '& $line': {
      backgroundColor: "#D52B1E",
    },
  },
  line: {
    margin: "0 10px 0 10px",
    height: 3,
    border: 0,
    backgroundColor: '#eaeaf0',
    borderRadius: 1,
  },
})(StepConnector);

const getStepContent = (steps, stepIndex) => {
  return steps.find(step => step.stepNumber === stepIndex).content
}

export const SetupStepper = ({ steps, stepInputIsValid, setStepInputIsValid }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (stepInputIsValid){
      setStepInputIsValid(false);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const StepIcon = (props) => {
    const classes = useColorlibStepIconStyles();
    const { active, completed, icon } = props;

    return (
      <div
        className={`${classes.root} ${active && classes.active} ${(completed || activeStep === steps.length - 1 ) && classes.completed}`}
      >
        <Typography className={`${active && classes.activeText} ${!completed && !active && classes.notCompletedText}`}>{completed || activeStep === steps.length - 1  ? <CheckIcon fontSize='small' style={{ marginTop: 5, color: "#ECECEC" }}/> : icon}</Typography>
      </div>
    );
  }

  const onStepClick = (stepNumber) => {
    if(stepNumber > activeStep) return;
    setActiveStep(stepNumber)
  }

  return (
    <>
      <Stepper activeStep={activeStep} alternativeLabel className={classes.stepper} connector={<Connector />}>
        {steps.map((step) => (
          <Step className={classes.step} key={step.name} onClick={() => onStepClick(step.stepNumber)}>
            <StepLabel StepIconComponent={StepIcon}>
              <Typography style={{ color: step.stepNumber >= activeStep ? "#7C7C7C" : "#D52B1E"}}>{step.name}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' alignItems='center' style={{ marginBottom: 50 }}>
            {getStepContent(steps, activeStep)}
          </Grid>
          <Grid container direction='column' alignItems='center'>
            <Grid item>
              {activeStep !== 0 && (
                <Button
                  color="primary"
                  variant='outlined'
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.backButton}
                >
                  {strings(stringKeys.common.buttons.previous)}
                </Button>
              )}
              <Button variant={stepInputIsValid ? "contained" : "outlined"} color="primary" onClick={activeStep === steps.length - 1 ? handleReset : handleNext}>
                {activeStep === steps.length - 1 ? strings(stringKeys.common.buttons.finish) : strings(stringKeys.common.buttons.next)}
              </Button>
            </Grid>
            <Grid item style={{ marginTop: 10 }}>
              <Button color="primary" onClick={handleReset}>
                {strings(stringKeys.form.cancel)}
              </Button>
            </Grid>
          </Grid>
        </Grid>
    </>
  );
}