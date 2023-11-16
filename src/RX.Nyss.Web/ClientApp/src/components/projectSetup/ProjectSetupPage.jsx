import React from 'react';
import { connect} from "react-redux";
import { withLayout } from '../../utils/layout';
import Layout from '../layout/Layout';


const ProjectSetupPageComponent = ({...props}) => {

  return (
    <div>
      <h2>Setup-form goes here</h2>
    </div>
  );
}

ProjectSetupPageComponent.propTypes = {
};

const mapStateToProps = (state, ownProps) => ({
});

const mapDispatchToProps = {
};

export const ProjectSetupPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectSetupPageComponent)
);
