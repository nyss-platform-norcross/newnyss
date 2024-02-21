import { stringKeys, stringKey } from "../strings";
import * as cache from "./cache";
import { reloadPage } from "./page";
import { RequestError } from "./RequestError";

export const post = (path, data, anonymous, abortSignal) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  return callApi(path, "POST", data || {}, headers, !anonymous, abortSignal);
};

export const get = (path, anonymous, abortSignal) => {
  return callApi(path, "GET", undefined, {}, !anonymous, abortSignal);
};

export const getCached = ({ path, dependencies }) =>
  cache.retrieve({
    key: path,
    setter: () => get(path),
    dependencies: dependencies,
  });

export const deleteHttp = (path, anonymous) => {
  return callApi(path, "DELETE", undefined, {}, !anonymous);
};

export const put = (path, data, anonymous) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  return callApi(path, "PUT", data || {}, headers, !anonymous);
};

export const handleValidationError = (response) => {
  const message = stringKey(
    (response.message && response.message.key) ||
      stringKeys.error.responseNotSuccessful,
  );
  const data = response.message && response.message.data;

  throw new RequestError(message, data);
};

const callApi = (
  path,
  method,
  data,
  headers = {},
  authenticate = false,
  abortSignal = null,
) => {
  const securityHeaders = {
    "Content-Security-Policy":
      "base-uri 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "frame-ancestors 'self'; " +
      "form-action 'self'; " +
      "img-src 'self' data: https://*.tile.openstreetmap.org/ https://unpkg.com/leaflet@1.7.1/dist/images/; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/ https://unpkg.com/leaflet@1.7.1/dist/leaflet.css; " +
      "object-src 'none'; " +
      "frame-src 'self'; " +
      "connect-src 'self' wss://localhost:0/sockjs-node https://*.in.applicationinsights.azure.com/; " +
      "media-src 'self'; " +
      "font-src 'self' https://fonts.gstatic.com/s/materialicons/; " +
      "manifest-src 'self';",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
  };

  return new Promise((resolve, reject) => {
    let init = {
      method,
      redirect: "manual",
      credentials: "include",
      headers: new Headers({
        ...headers,
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Expires: "0",
        ...(window.userLanguage
          ? { "Accept-Language": `${window.userLanguage}, en;q=0.5` }
          : {}),
        ...securityHeaders,
      }),
      signal: abortSignal,
    };

    if (data) {
      init.body = JSON.stringify(data);
    }

    fetch(path, init)
      .then((response) => {
        if (response.ok) {
          if (response.status === 204) {
            resolve();
          } else {
            resolve(response.json());
          }
        } else if (
          response.status === 0 &&
          response.type === "opaqueredirect"
        ) {
          reject(new Error(stringKey(stringKeys.error.redirected)));
        } else if (response.status === 401) {
          reloadPage();
          reject(new Error(stringKey(stringKeys.error.notAuthenticated)));
        } else if (response.status === 403) {
          reject(new Error(stringKey(stringKeys.error.unauthorized)));
        } else if (response.status === 429) {
          reject(new Error(stringKey(stringKeys.error.tooManyRequests)));
        } else if (response.status === 400) {
          return response
            .json()
            .then((data) => handleValidationError(data))
            .catch((e) => reject(e));
        } else {
          return response
            .json()
            .then((data) => reject(new Error(stringKey(data.message.key))))
            .catch((e) => reject(e));
        }
      })
      .catch(reject);
  });
};
