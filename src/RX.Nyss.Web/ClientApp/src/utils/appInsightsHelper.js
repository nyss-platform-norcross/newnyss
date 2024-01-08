import { getAppInsights } from "../components/app/ApplicationInsightsProvider";
import store from "../store";

export const trackPageView = (name, properties) => {
  const user = store.getState().appData.user;
  const userRole = user ? user.roles[0] : undefined;

  const appInsights = getAppInsights();
  appInsights.trackPageView({
    name,
    properties: {
      userRole,
      ...properties,
    },
  });
};

export const trackEvent = (name, properties) => {
  const user = store.getState().appData.user;
  const userRole = user ? user.roles[0] : undefined;

  const appInsights = getAppInsights();
  appInsights.trackEvent({
    name,
    properties: {
      userRole,
      ...properties,
    },
  });
};
