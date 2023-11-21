import { TextField, Typography } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import * as projectSetupActions from './logic/projectSetupActions';
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  input: {
    width: 270,
    "& .MuiInput-formControl": {
      marginTop: "0px !important"
    }
  },
}));

export const ProjectSetupNameComponent = ({ projectName, setProjectName }) => {
  const classes = useStyles()

  const handleChange = (event) => {
    setProjectName(event.target.value)
  }

  return (
    <>
      <Typography variant="h5">What is the project name?</Typography>
      <TextField value={projectName} onChange={handleChange} className={classes.input} />
    </>
  )
}

const mapStateToProps = (state) => ({
  projectName: state.projectSetup.projectName,
});

const mapDispatchToProps = {
  setProjectName: projectSetupActions.setProjectName,
};

export const ProjectSetupName = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupNameComponent);
