import React from "react";
import { Button } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

export const GoBackToButton = ({ onClick, variant, children, size }) => (
  <Button
    onClick={onClick}
    startIcon={<ArrowBackIcon />}
    variant={variant}
    color="primary"
    size={size}
  >
    {children}
  </Button>
);

export default GoBackToButton;
