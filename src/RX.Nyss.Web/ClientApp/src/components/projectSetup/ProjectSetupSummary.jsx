import { InputLabel, Grid, Divider } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { connect, useSelector } from "react-redux";
import { strings, stringKeys } from '../../strings';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(() => ({
  inputLabel: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 50,
  },
  card: {
    minWidth: "80%",
    border: "none",
    boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)"
  },
  cardContent: {
    padding: 50,
  },
  divider: {
    margin: "30px 0 30px 0",
  }
}));

const SummaryRow = ({ name, value }) => {
  const classes = useStyles()

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <Typography>
            {name}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography style={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Grid>
      </Grid>
      <Divider className={classes.divider}/>
    </>
  )
}

const ProjectSetupSummaryComponent = (props) => {
  const { projectName, organizationId, recipients, healthRisks, regions, districts, villages, zones } = props;
  const classes = useStyles();
  const organizationName = useSelector(state => state.appData.formData?.organizations.find(org => org.id === organizationId));
  // const newRegions = regions.filter(region => region.canModiy);
  // const newDistricts = districts.filter(district => district.canModiy);
  // const newVillages = villages.filter(village => village.canModiy);
  // const newZones = zones.filter(zone => zone.canModiy);

  return (
    <>
      <InputLabel className={classes.inputLabel}>{strings(stringKeys.projectSetup.summary.title)}</InputLabel>
      <Card className={classes.card} variant="elevation">
        <CardContent className={classes.cardContent}>
          <SummaryRow name={strings(stringKeys.projectSetup.projectName.name)} value={projectName}/>
          <SummaryRow name={strings(stringKeys.projectSetup.projectOrganization.name)} value={organizationName ?? "Org"}/>
          <SummaryRow name="Unhandled alert notification recipients" value="Tonje Løfqvist"/>
        </CardContent>
      </Card>
    </>
  )
}

const mapStateToProps = (state) => ({
  projectName: state.projectSetup.projectName,
  organizationId: state.projectSetup.organizationId,
  recipients: state.projectSetup.alertNotHandledRecipients,
  healthRisks: state.projectSetup.healthRisks,
  regions: state.projectSetup.regions,
  districts: state.projectSetup.districts,
  villages: state.projectSetup.villages,
  zones: state.projectSetup.zones,
});

const mapDispatchToProps = {
};

export const ProjectSetupSummary = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupSummaryComponent);
