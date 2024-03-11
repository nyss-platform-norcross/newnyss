import { makeStyles } from "@material-ui/core/styles";
import { SubMenuTitle } from "../../layout/SubMenuTitle";

const useStyles = makeStyles((theme) => ({
  tableHeader: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    "@media screen and (max-width: 500px)": {
      flexDirection: "column",
    },
  },
  settingsHeaderStyle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const TableHeader = ({ children, settingsHeader = false }) => {
  const classes = useStyles();

  return (
    <div
      className={`${
        settingsHeader ? classes.settingsHeaderStyle : classes.tableHeader
      }`}
    >
      <SubMenuTitle />
      {children}
    </div>
  );
};

export default TableHeader;
