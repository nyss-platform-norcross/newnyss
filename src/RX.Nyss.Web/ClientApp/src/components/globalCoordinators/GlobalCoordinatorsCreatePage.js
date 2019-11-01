import React, { useState, Fragment } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useLayout } from '../../utils/layout';
import { validators, createForm } from '../../utils/forms';
import * as globalCoordinatorsActions from './logic/globalCoordinatorsActions';
import * as appActions from '../app/logic/appActions';
import Layout from '../layout/Layout';
import Form from '../forms/form/Form';
import FormActions from '../forms/formActions/FormActions';
import SubmitButton from '../forms/submitButton/SubmitButton';
import Typography from '@material-ui/core/Typography';
import TextInputField from '../forms/TextInputField';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Button from "@material-ui/core/Button";
import { useMount } from '../../utils/lifecycle';

const GlobalCoordinatorsCreatePageComponent = (props) => {
  const [form] = useState(() => {
    const fields = {
      name: "",
      email: "",
      phoneNumber: "",
      additionalPhoneNumber: "",
      organization: ""
    };

    const validation = {
      name: [validators.required, validators.maxLength(100)],
      email: [validators.required, validators.email, validators.maxLength(100)],
      phoneNumber: [validators.required, validators.maxLength(20), validators.phoneNumber],
      additionalPhoneNumber: [validators.maxLength(20), validators.phoneNumber],
      organization: [validators.maxLength(100)]
    };

    return createForm(fields, validation);
  });

  useMount(() => {
    props.openModule(props.match.path, props.match.params)
  })

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.isValid()) {
      return;
    };

    const values = form.getValues();
    props.create(values);
  };

  return (
    <Fragment>
      <Typography variant="h2">Add Global Coordinator</Typography>

      {props.error &&
        <SnackbarContent
          message={props.error}
        />
      }

      <Form onSubmit={handleSubmit}>
        <TextInputField
          label="E-mail"
          name="email"
          field={form.fields.email}
          autoFocus
        />

        <TextInputField
          label="Name"
          name="name"
          field={form.fields.name}
        />

        <TextInputField
          label="Phone number"
          name="phoneNumber"
          field={form.fields.phoneNumber}
        />

        <TextInputField
          label="Additional phone number (optional)"
          name="additionalPhoneNumber"
          field={form.fields.additionalPhoneNumber}
        />

        <TextInputField
          label="Organization"
          name="organization"
          field={form.fields.organization}
        />

        <FormActions>
          <Button onClick={() => props.goToList()}>
            Cancel
          </Button>

          <SubmitButton isFetching={props.isSaving}>
            Save Global Coordinator
          </SubmitButton>
        </FormActions>
      </Form>
    </Fragment>
  );
}

GlobalCoordinatorsCreatePageComponent.propTypes = {
  getGlobalCoordinators: PropTypes.func,
  openModule: PropTypes.func,
  list: PropTypes.array
};

const mapStateToProps = state => ({
  contentLanguages: state.appData.contentLanguages,
  countries: state.appData.countries,
  error: state.globalCoordinators.formError,
  isSaving: state.globalCoordinators.formSaving
});

const mapDispatchToProps = {
  getList: globalCoordinatorsActions.getList.invoke,
  create: globalCoordinatorsActions.create.invoke,
  goToList: globalCoordinatorsActions.goToList,
  openModule: appActions.openModule.invoke
};

export const GlobalCoordinatorsCreatePage = useLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(GlobalCoordinatorsCreatePageComponent)
);