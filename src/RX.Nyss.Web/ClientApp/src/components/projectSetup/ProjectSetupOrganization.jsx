import { Select, MenuItem, InputLabel, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import * as projectSetupActions from './logic/projectSetupActions';
import { useMount } from '../../utils/lifecycle';

const useStyles = makeStyles(() => ({
  rtl: {
    marginRight: "unset",
    marginLeft: "3ch",
  },
  inputText: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: 8,
  },
  inputField: {
    width: 270,
  }

}));

export const ProjectSetupOrganizationComponent = ({organizations, rtl, setStepInputIsValid, setOrganizationId, selectedOrganizationId}) => {
  const classes = useStyles();
  
  useMount(() => {
    selectedOrganizationId && setStepInputIsValid(true);
  });

  const handleChange = (event) => {
    setOrganizationId(event.target.value);
    setStepInputIsValid(true);
  };
  
  return (
    <>
      <InputLabel className={classes.inputText}>Choose organization</InputLabel>
      <Select 
        className={`${classes.inputField} ${rtl ? classes.rtl : ""}`}
        onChange={handleChange}
        value={selectedOrganizationId ? selectedOrganizationId : ""}
        displayEmpty
        renderValue={selectedId => {
          if (selectedId === "") {
            return <Typography style={{ color: "#4F4F4F", fontSize: 12 }}>Select an organization</Typography>;
          }
          const selectedOrganization = organizations.find(org => org.id === selectedId);
          return selectedOrganization ? selectedOrganization.name : "";
        }}
      >
        {organizations?.map(organization => 
          <MenuItem
            key={organization.name}
            value={organization.id}
          >
            {organization.name}
          </MenuItem>
        )}
      </Select>
    </>
  );
};

const mapStateToProps = (state) => ({
  organizations: state.projectSetup.formData?.organizations,
  selectedOrganizationId: state.projectSetup.organizationId
});

const mapDispatchToProps = {
  setOrganizationId: projectSetupActions.setOrganizationId,
};

export const ProjectSetupOrganization = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupOrganizationComponent);
