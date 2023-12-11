import { getAppInsights } from "../components/app/ApplicationInsightsProvider";

export const trackPageView = (name) => {
  const appInsights = getAppInsights();
  appInsights.trackPageView({ name });
};
