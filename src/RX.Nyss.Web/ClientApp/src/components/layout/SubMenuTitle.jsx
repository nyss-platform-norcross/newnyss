import { connect } from "react-redux";
import { makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  header: {
    fontSize: '24px !important',
    margin: '10px 0',
    fontWeight: '600',
    '@media screen and (max-width: 800px)': {
      fontSize: '18px !important',
    },
  },
}));

const SubMenuTitleComponent = ({ title, ...props }) => {
  const classes = useStyles();

  return (
  <Typography className={classes.header} {...props}>{title}</Typography>
)};

const mapStateToProps = state => ({
  title: state.appData.siteMap.title
});


export const SubMenuTitle = connect(mapStateToProps)(SubMenuTitleComponent);

