import { Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { stringKeys, strings } from "../../../strings";

const useStyles = makeStyles(() => ({
  Escalated: {
    backgroundColor: "#CDDDE7",
  },
  Closed: {
    backgroundColor: "#E3E3CF",
  },
  Open: {
    backgroundColor: "#FFE497",
  },
}));

export const AlertStatusChip = ({ status }) => {
  const classes = useStyles();
  return (
    <Chip
      label={
        <Typography style={{ fontSize: 12 }}>
          {strings(stringKeys.alerts.assess.status[status])}
        </Typography>
      }
      className={`${classes[status]}`}
    />
  );
};
