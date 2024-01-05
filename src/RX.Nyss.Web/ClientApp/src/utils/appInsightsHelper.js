import { getAppInsights } from "../components/app/ApplicationInsightsProvider";


export const trackPageView = (name) => {
  const appInsights = getAppInsights();
  appInsights.trackPageView({ name });
};

export const trackEvent = (name, properties) => {
  const appInsights = getAppInsights();
  appInsights.trackEvent({ name, properties });
};
