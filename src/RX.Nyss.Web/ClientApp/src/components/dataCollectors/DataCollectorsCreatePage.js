import formStyles from "../forms/form/Form.module.scss";
import styles from "./DataCollectorsCreateOrEditPage.module.scss";
import {useState, Fragment, useMemo, createRef } from 'react';
import { connect, useSelector } from "react-redux";
import {
  Radio,
  FormControlLabel,
  MenuItem,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import { withLayout } from '../../utils/layout';
import { validators, createForm, useCustomErrors } from '../../utils/forms';
import * as dataCollectorsActions from './logic/dataCollectorsActions';
import Layout from '../layout/Layout';
import Form from '../forms/form/Form';
import FormActions from '../forms/formActions/FormActions';
import SubmitButton from '../common/buttons/submitButton/SubmitButton';
import TextInputField from '../forms/TextInputField';
import SelectField from '../forms/SelectField';
import RadioGroupField from '../forms/RadioGroupField';
import { useMount } from '../../utils/lifecycle';
import { strings, stringKeys } from '../../strings';
import { sexValues, dataCollectorType } from './logic/dataCollectorsConstants';
import { getSaveFormModel } from './logic/dataCollectorsService';
import { Loading } from '../common/loading/Loading';
import { ValidationMessage } from "../forms/ValidationMessage";
import { HeadSupervisor, Supervisor } from "../../authentication/roles";
import CheckboxField from "../forms/CheckboxField";
import PhoneInputField from "../forms/PhoneInputField";
import { DataCollectorLocationItem } from "./components/DataCollectorLocationItem";
import { getBirthDecades, parseBirthDecade } from "../../utils/birthYear";
import CancelButton from '../common/buttons/cancelButton/CancelButton';


const DataCollectorsCreatePageComponent = (props) => {
  const currentUserRoles = useSelector(state => state.appData.user.roles);
  const useRtlDirection = useSelector(state => state.appData.direction === 'rtl');
  const [birthDecades] = useState(getBirthDecades());
  const [type, setType] = useState(dataCollectorType.human);
  const [centerLocation, setCenterLocation] = useState(null);
  const [locations, setLocations] = useState([{
    latitude: '',
    longitude: '',
    regionId: '',
    districtId: '',
    villageId: '',
    zoneId: '',
    number: 0
  }]);


  useMount(() => {
    props.openCreation(props.projectId);
  })

  const form = useMemo(() => {
    if (!props.defaultLocation) {
      return null;
    }

    setCenterLocation({ latitude: props.defaultLocation.latitude, longitude: props.defaultLocation.longitude });

    const fields = {
      dataCollectorType: dataCollectorType.human,
      name: "",
      displayName: "",
      sex: "",
      supervisorId: props.defaultSupervisorId ? props.defaultSupervisorId.toString() : "",
      birthGroupDecade: "",
      phoneNumber: "",
      additionalPhoneNumber: "",
      deployed: true,
      linkedToHeadSupervisor: false
    };

    const validation = {
      dataCollectorType: [validators.required],
      name: [validators.required, validators.maxLength(100)],
      displayName: [validators.requiredWhen(x => x.dataCollectorType === dataCollectorType.human), validators.maxLength(100)],
      sex: [validators.requiredWhen(x => x.dataCollectorType === dataCollectorType.human)],
      supervisorId: [validators.required],
      phoneNumber: [validators.phoneNumber, validators.maxLength(20)],
      additionalPhoneNumber: [validators.phoneNumber, validators.maxLength(20)]
    };

    const refs = {
      dataCollectorType: createRef(),
      name: createRef(),
      displayName: createRef(),
      sex: createRef(),
      supervisorId: createRef(),
      phoneNumber: createRef(),
      additionalPhoneNumber: createRef(),
      deployed: createRef(),
      linkedToHeadSupervisor: createRef()
    }

    const newForm = createForm(fields, validation, refs);
    newForm.fields.dataCollectorType.subscribe(({ newValue }) => setType(newValue));
    newForm.fields.supervisorId.subscribe(({ newValue }) =>
      !!newValue && newForm.fields.linkedToHeadSupervisor.update(props.supervisors.filter(s => s.id.toString() === newValue)[0].role === HeadSupervisor));
    return newForm;
  }, [props.defaultSupervisorId, props.defaultLocation, props.supervisors]);

  const addDataCollectorLocation = () => {
    const previousLocation = locations[locations.length - 1];
    const previousRegionId = form.fields[`locations_${previousLocation.number}_regionId`].value || '';
    const previousDistrictId = form.fields[`locations_${previousLocation.number}_districtId`].value || '';

    setLocations([...locations, {
      latitude: '',
      longitude: '',
      regionId: previousRegionId,
      districtId: previousDistrictId,
      villageId: '',
      zoneId: '',
      number: previousLocation.number + 1
    }]);
  }

  const removeDataCollectorLocation = (location) => {
    setLocations(locations.filter(l => l.number !== location.number));
  }


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.isValid()) {

      Object.values(form.fields).filter(e => e.error)[0].scrollTo();
      return;
    }

    const values = form.getValues();

    props.create(getSaveFormModel(props.projectId, values, values.dataCollectorType, locations));
  };

  useCustomErrors(form, props.error);

  if (props.isFetching) {
    return <Loading />;
  }

  if (!form) {

    return null;
  }

  return (

    <Fragment>
      {props.error && !props.error.data && <ValidationMessage message={props.error.message}/>}
      <Form onSubmit={handleSubmit} fullWidth>
        <Grid container spacing={2} className={formStyles.shrinked}>
          <Grid item xs={12}>
            <RadioGroupField
              name="dataCollectorType"
              label={strings(stringKeys.dataCollectors.form.dataCollectorType)}
              boldLabel
              field={form.fields.dataCollectorType}
              horizontal >
              {Object.keys(dataCollectorType).map(type => (
                <FormControlLabel key={type} control={<Radio />} label={strings(stringKeys.dataCollectors.constants.dataCollectorType[dataCollectorType[type]])} value={dataCollectorType[type]} />
              ))}
            </RadioGroupField>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">{strings(stringKeys.dataCollectors.filters.deployedMode)}</Typography>
            <CheckboxField
              name="deployed"
              label={strings(stringKeys.dataCollectors.form.deployed)}
              field={form.fields.deployed}
              color="primary"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">{strings(stringKeys.dataCollectors.form.personalia)}</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextInputField
              label={strings(stringKeys.common.name)}
              name="name"
              field={form.fields.name}
              fieldRef={form.fields.name.ref}
            />
          </Grid>

          {type === dataCollectorType.human && (<Grid item xs={12}>
            <TextInputField
              label={strings(stringKeys.dataCollectors.form.displayName)}
              name="displayName"
              field={form.fields.displayName}
              fieldRef={form.fields.displayName.ref}

            />
          </Grid>)}

          {type === dataCollectorType.human && (
            <Grid item xs={12}>
              <SelectField
                label={strings(stringKeys.dataCollectors.form.sex)}
                name="sex"
                field={form.fields.sex}
                fieldRef={form.fields.sex.ref}
              >
                {sexValues.map(type => (
                  <MenuItem key={`sex${type}`} value={type}>
                    {strings(stringKeys.dataCollectors.constants.sex[type.toLowerCase()])}
                  </MenuItem>
                ))}
              </SelectField>
            </Grid>
          )}


          {type === dataCollectorType.human && (<Grid item xs={12}>
            <div hidden={true}>
              <SelectField
                label={strings(stringKeys.dataCollectors.form.birthYearGroup)}
                field={form.fields.birthGroupDecade}
                name="birthGroupDecade"
                fieldRef={form.fields.birthGroupDecade.ref}
              >
                {birthDecades.map(decade => (
                  <MenuItem key={`birthDecade_${decade}`} value={decade}>
                    {parseBirthDecade(decade)}
                  </MenuItem>
                ))}
              </SelectField>
            </div>
            </Grid>)}

          <Grid item xs={12}>
            <PhoneInputField
              label={strings(stringKeys.dataCollectors.form.phoneNumber)}
              name="phoneNumber"
              fieldRef={form.fields.phoneNumber.ref}
              field={form.fields.phoneNumber}
              defaultCountry={props.countryCode}
            />
          </Grid>
          {type === dataCollectorType.human && (<Grid item xs={12}>
            <PhoneInputField
              label={strings(stringKeys.dataCollectors.form.additionalPhoneNumber)}
              name="additionalPhoneNumber"
              field={form.fields.additionalPhoneNumber}
              defaultCountry={props.countryCode}
              rtl={useRtlDirection}
            />
          </Grid>)}

          {!currentUserRoles.some(r => r === Supervisor) && (
            <Grid item xs={12}>
              <SelectField
                label={strings(stringKeys.dataCollectors.form.supervisor)}
                field={form.fields.supervisorId}
                name="supervisorId"
                fieldRef={form.fields.supervisorId.ref}
              >
                {props.supervisors.map(supervisor => (
                  <MenuItem key={`supervisor_${supervisor.id}`} value={supervisor.id.toString()}>
                    {supervisor.name}
                  </MenuItem>
                ))}
              </SelectField>
            </Grid>)}
        </Grid>

        <Grid container spacing={2} className={styles.locationsContainer}>
          <Grid item xs={12} container justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{strings(stringKeys.dataCollectors.form.locationsHeader)}</Typography>
            <Button className={styles.addAnotherLocation} color='primary' variant="outlined" onClick={addDataCollectorLocation}>{strings(stringKeys.dataCollectors.form.addLocation)}</Button>
          </Grid>

          {locations.map((location, i) => (
            <DataCollectorLocationItem
              key={`location_${location.number}`}
              form={form}
              location={location}
              locationNumber={location.number}
              isLastLocation={i === locations.length - 1}
              isOnlyLocation={locations.length === 1}
              defaultLocation={centerLocation}
              regions={props.regions}
              isDefaultCollapsed={false}
              removeLocation={removeDataCollectorLocation}
              allLocations={locations}
              rtl={useRtlDirection}
            />
          ))}

        </Grid>

        <FormActions>
          <CancelButton
            variant="outlined"
            onClick={() => props.goToList(props.projectId)}
          >
            {strings(stringKeys.form.cancel)}
          </CancelButton>
          <SubmitButton isFetching={props.isSaving}>{strings(stringKeys.common.buttons.add)}</SubmitButton>
        </FormActions>
      </Form>
    </Fragment>
  );
}

DataCollectorsCreatePageComponent.propTypes = {
};

const mapStateToProps = (state, ownProps) => ({
  projectId: ownProps.match.params.projectId,
  countryName: state.appData.siteMap.parameters.nationalSocietyCountry,
  isFetching: state.dataCollectors.formFetching,
  isSaving: state.dataCollectors.formSaving,
  regions: state.dataCollectors.formRegions,
  defaultLocation: state.dataCollectors.formDefaultLocation,
  supervisors: state.dataCollectors.formSupervisors,
  defaultSupervisorId: state.dataCollectors.formDefaultSupervisorId,
  isGettingCountryLocation: state.dataCollectors.gettingLocation,
  country: state.dataCollectors.countryData,
  error: state.dataCollectors.formError,
  countryCode: state.dataCollectors.countryCode
});

const mapDispatchToProps = {
  openCreation: dataCollectorsActions.openCreation.invoke,
  create: dataCollectorsActions.create.invoke,
  goToList: dataCollectorsActions.goToList
};

export const DataCollectorsCreatePage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(DataCollectorsCreatePageComponent)
);
