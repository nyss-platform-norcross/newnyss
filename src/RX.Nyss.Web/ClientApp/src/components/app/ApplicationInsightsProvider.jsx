import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let ai;

export const ApplicationInsightsProvider = ({connectionString, children}) => {
  ai = new ApplicationInsights({ config: { connectionString: connectionString } });
  ai.loadAppInsights();

  return <>{children}</>;
};

export const getAppInsights = () => ai;