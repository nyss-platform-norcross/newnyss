import React from "react";
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

export const GoBackToButton = ({ onClick, variant, children }) => (
  <Button
    onClick={onClick}
    startIcon={<ArrowBackIcon />}
    variant={variant}
    color="primary"
  >
    {children}
  </Button>
);

export default GoBackToButton;
