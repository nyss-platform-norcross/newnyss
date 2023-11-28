import { InputLabel, Grid, Divider, Chip } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import { strings, stringKeys } from '../../strings';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography'
import TrendingFlatIcon from '@material-ui/icons/TrendingFlat';

const useStyles = makeStyles((theme) => ({
  inputLabel: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 50,
  },
  card: {
    width: "80%",
    border: "none",
    boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.25)"
  },
  cardContent: {
    padding: 50,
  },
  divider: {
    margin: "30px 0 30px 0",
  },
  healthRisk: {
    backgroundColor: "#CDDDE7",
    margin: 4
  },
  newLocation: {
    fontWeight: 700,
    color: theme.palette.primary.main
  },
  arrow: {
    margin: "0 8px 0 8px"
  }
}));

const SummaryRow = ({ name, value }) => {
  const classes = useStyles()
  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <Typography>
            {name}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography style={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Grid>
      </Grid>
      <Divider className={classes.divider}/>
    </>
  )
}
const SummaryHealthRisksRow = ({ name, healthRisks }) => {
  const classes = useStyles()
  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <Typography>
            {name}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          {healthRisks.map(hr => (
            <Chip label={hr.name} className={classes.healthRisk} key={hr.id}/>
          ))}
        </Grid>
      </Grid>
      <Divider className={classes.divider}/>
    </>
  )
}

const SummaryGeographicalStructureRow = ({ name, rows }) => {
  const classes = useStyles()
  return (
    <>
      <Grid container>
        <Grid item xs={4}>
          <Typography>
            {name}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          {rows.map(row => {
            return (
              <Grid item container direction="row" xs={12} alignItems="center" key={row.region.id}>
                <Typography className={row.region.canModify && classes.newLocation}>
                  {row.region.name}
                </Typography>
                {row.district && <TrendingFlatIcon className={classes.arrow}/>}
                {row.district && (
                  <>
                    <Typography className={row.district.canModify && classes.newLocation}>
                      {row.district.name}
                    </Typography>
                    {row.village && <TrendingFlatIcon fontSize="small" className={classes.arrow}/>}
                  </>
                )}
                {row.village && (
                  <>
                    <Typography className={row.village.canModify && classes.newLocation}>
                      {row.village.name}
                    </Typography>
                    {row.zone && <TrendingFlatIcon fontSize="small" className={classes.arrow}/>}
                  </>
                )}
                {row.zone && (
                  <>
                    <Typography className={row.zone.canModify && classes.newLocation}>
                      {row.zone.name}
                    </Typography>
                  </>
                )}
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </>
  )
}

const ProjectSetupSummaryComponent = (props) => {
  let { projectName, organizations, organizationId, recipients, recipientIds, healthRisks, regions, districts, villages, zones } = props;
  const classes = useStyles();
  const organizationName = organizations?.find(org => org.id === organizationId).name;
  // const selectedRecipients = recipients.filter(recipient => recipientIds.includes(recipient.id)).map(recipient => recipient.name);

  // Dummy data
  const selectedRecipients = ["Ian", "Alvar", "Sondre", "Tonje", "Ian", "Alvar", "Sondre", "Tonje", "Ian", "Alvar", "Sondre", "Tonje", "Ian", "Alvar", "Sondre", "Tonje"]
  const selectedHealthRisks = [{ name: "Fever and rash", id: 1 }, { name: "Acute Watery Diaherra", id: 2 }, { name: "Fever and body pain", id: 3 }, { name: "Fever and neck stiffness", id: 4 }]
  regions = [{ id: "reg1",  name: "Region1", nationalSocietyId: "ns" }, { id: "reg2",  name: "Region2", nationalSocietyId: "ns", canModify: true }]
  districts = [{ id: "dis1",  name: "District1", regionId: "reg1" }, { id: "dis2",  name: "District2", regionId: "reg2", canModify: true }]
  villages = [{ id: "vil1",  name: "Village1", districtId: "dis1" }, { id: "vil2",  name: "Village2", districtId: "dis2", canModify: true }]
  zones = [{ id: "zon1",  name: "Zone1", villageId: "vil1", canModify: true }]

  let allLocationRows = []
  regions.forEach(region => allLocationRows.push({ region: region }))
  districts.forEach(district => {
    allLocationRows.forEach(row => {
      if (district.regionId === row.region.id) {
        row.district = district
        return;
      }
    })
  })
  villages.forEach(village => {
    allLocationRows.forEach(row => {
      if (village.districtId === row.district.id) {
        row.village = village
        return;
      }
    })
  })
  zones.forEach(zone => {
    allLocationRows.forEach(row => {
      if (zone.villageId === row.village.id) {
        row.zone = zone
        return;
      }
    })
  })
  const newLocationRows = allLocationRows.filter(row => row.region.canModify || row.district.canModify || row.village.canModify || row.zone.canModify)

  return (
    <>
      <InputLabel className={classes.inputLabel}>{strings(stringKeys.projectSetup.summary.title)}</InputLabel>
      <Card className={classes.card} variant="elevation">
        <CardContent className={classes.cardContent}>
          <SummaryRow name={strings(stringKeys.projectSetup.projectName.name)} value={projectName}/>
          <SummaryRow name={strings(stringKeys.projectSetup.projectOrganization.name)} value={organizationName}/>
          <SummaryRow name="Unhandled alert notification recipients" value={selectedRecipients?.join(', ')}/>
          <SummaryHealthRisksRow name="Health risks" healthRisks={selectedHealthRisks} />
          <SummaryGeographicalStructureRow name="Geographical structure" rows={newLocationRows}/>
        </CardContent>
      </Card>
    </>
  )
}

const mapStateToProps = (state) => ({
  projectName: state.projectSetup.projectName,
  organizationId: state.projectSetup.organizationId,
  recipients: state.projectSetup.formData?.alertNotHandledNotificationRecipients,
  organizations: state.projectSetup.formData?.organizations,
  recipientIds: state.projectSetup.alertNotHandledNotificationRecipientIds,
  healthRisks: state.projectSetup.healthRisks,
  regions: state.projectSetup.regions,
  districts: state.projectSetup.districts,
  villages: state.projectSetup.villages,
  zones: state.projectSetup.zones,
});

const mapDispatchToProps = {
};

export const ProjectSetupSummary = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupSummaryComponent);
