import { Select, Typography, MenuItem } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  rtl: {
    marginRight: "unset",
    marginLeft: "3ch",
  },

}));

export const ProjectSetupOrganization = ({organizations, rtl}) => {
  const classes = useStyles();
  
  return (
    <>
      <Typography>Choose organization</Typography>
      <Select 
        className={`${rtl ? classes.rtl : ""}`}
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