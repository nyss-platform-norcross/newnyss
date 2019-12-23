import { placeholders } from "../../../siteMapPlaceholders";
import { accessMap } from "../../../authentication/accessMap";
import { strings, stringKeys } from "../../../strings";
import { projectLeftMenuOrder } from "../../projects/logic/projectsSiteMap";

export const projectDashboardSiteMap = [
  {
    parentPath: "/nationalsocieties/:nationalSocietyId/projects/:projectId",
    path: "/nationalsocieties/:nationalSocietyId/projects/:projectId/dashboard",
    title: () => strings(stringKeys.project.dashboard.title),
    access: accessMap.projects.get,
    placeholder: placeholders.leftMenu,
    placeholderIndex: projectLeftMenuOrder.dashboard
  }
];
