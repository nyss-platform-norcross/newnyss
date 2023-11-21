import { Select, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  rtl: {
    marginRight: "unset",
    marginLeft: "3ch",
  },

}));

export const ProjectSetupOrganization = ({rtl}) => {
  const classes = useStyles();
  return (
    <>
      <Typography>Choose organization</Typography>
      <Select 
      className={`${rtl ? classes.rtl : ""}`}
      >
      </Select>
    </>
  );
};