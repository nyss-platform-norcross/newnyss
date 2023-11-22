import { Select, MenuItem, InputLabel } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

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

export const ProjectSetupOrganization = ({organizations, rtl}) => {
  const classes = useStyles();
  
  return (
    <>
      <InputLabel className={classes.inputText}>Choose organization</InputLabel>
      <Select 
        className={`${classes.inputField} ${rtl ? classes.rtl : ""}`}
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