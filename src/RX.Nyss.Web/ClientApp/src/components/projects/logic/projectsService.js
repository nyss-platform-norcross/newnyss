export const getSaveFormModel = (values, healthRisks) => (
    {
    name: values?.name,
    allowMultipleOrganizations: values?.allowMultipleOrganizations,
    timeZoneId: values?.timeZoneId,
    healthRisks: healthRisks && healthRisks.map(healthRisk => ({
      id: healthRisk.id,
      healthRiskId: healthRisk.healthRiskId,
      feedbackMessage: healthRisk.feedbackMessage,
      caseDefinition: healthRisk.caseDefinition,
      alertRuleCountThreshold: parseInt(healthRisk.alertRuleCountThreshold),
      alertRuleDaysThreshold: parseInt(healthRisk.alertRuleDaysThreshold),
      alertRuleKilometersThreshold: parseInt(healthRisk.alertRuleKilometersThreshold)
    })),
    organizationId: values && values.organizationId ? parseInt(values?.organizationId) : null,
    alertNotHandledNotificationRecipientId: parseInt(values?.alertNotHandledNotificationRecipientId)
  });