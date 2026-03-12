import styles from "./DataCollectorsPerformanceMap.module.scss";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  ScaleControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { Loading } from "../../common/loading/Loading";
import { Icon } from "@material-ui/core";
import { calculateBounds } from "../../../utils/map";
import { SignIcon } from "../../common/map/MarkerIcon";
import { getIconFromStatus } from "../logic/dataCollectorsService";
import { performanceStatus } from "../logic/dataCollectorsConstants";

const JITTER_RADIUS_DEGREES = 0.00012;

const createClusterIcon = (cluster) => {
  const data = cluster
    .getAllChildMarkers()
    .map((m) => m.options.dataCollectorInfo);

  const aggregatedData = {
    countReportingCorrectly: data.some((d) => d.countReportingCorrectly),
    countReportingWithErrors: data.some((d) => d.countReportingWithErrors),
    countNotReporting: data.some((d) => d.countNotReporting),
  };

  const status = getAggregatedStatus(aggregatedData);

  return new SignIcon({
    icon: getIconFromStatus(status),
    className: styles[`marker_${status}`],
    size: 40,
    multiple: true,
  });
};

const createIcon = (info) => {
  const status = getAggregatedStatus(info);

  return new SignIcon({
    icon: getIconFromStatus(status),
    className: styles[`marker_${status}`],
    size: 40,
  });
};

const getAggregatedStatus = (info) => {
  if (info.countReportingWithErrors) {
    return performanceStatus.reportingWithErrors;
  }

  if (info.countNotReporting) {
    return performanceStatus.notReporting;
  }

  return performanceStatus.reportingCorrectly;
};

const locationsWithDisplayPositions = (dataCollectorLocations) => {
  const groups = dataCollectorLocations.reduce((acc, dc) => {
    const key = `${dc.location.latitude}:${dc.location.longitude}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(dc);
    return acc;
  }, {});

  const result = [];

  Object.values(groups).forEach((group) => {
    if (group.length === 1) {
      result.push(group[0]);
      return;
    }

    const angleStep = (2 * Math.PI) / group.length;

    group.forEach((dc, index) => {
      const angle = index * angleStep;
      const offsetLat = JITTER_RADIUS_DEGREES * Math.sin(angle);
      const offsetLng = JITTER_RADIUS_DEGREES * Math.cos(angle);

      result.push({
        ...dc,
        displayPosition: {
          lat: dc.location.latitude + offsetLat,
          lng: dc.location.longitude + offsetLng,
        },
      });
    });
  });

  return result;
};

export const DataCollectorsPerformanceMap = ({
  centerLocation,
  dataCollectorLocations,
}) => {
  const [center, setCenter] = useState(null);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const hasLocations = dataCollectorLocations.length > 0;
    setCenter(
      hasLocations
        ? { lat: centerLocation.latitude, lng: centerLocation.longitude }
        : null,
    );
    setBounds(hasLocations ? calculateBounds(dataCollectorLocations) : null);
  }, [dataCollectorLocations, centerLocation]);

  const markersWithPosition = locationsWithDisplayPositions(
    dataCollectorLocations,
  );

  return (
    (!!center || !!bounds) && (
      <MapContainer
        center={center}
        length={4}
        bounds={bounds}
        zoom={5}
        maxZoom={17}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          showCoverageOnHover={false}
          iconCreateFunction={createClusterIcon}
        >
          {markersWithPosition.map((dc, i) => (
            <Marker
              className={`${styles.marker} ${
                dc.countNotReporting || dc.countReportingWithErrors
                  ? styles.markerInvalid
                  : styles.markerValid
              }`}
              key={`marker_${dc.dataCollectorId ?? i}`}
              position={{
                lat: dc.displayPosition
                  ? dc.displayPosition.lat
                  : dc.location.latitude,
                lng: dc.displayPosition
                  ? dc.displayPosition.lng
                  : dc.location.longitude,
              }}
              icon={createIcon(dc)}
              dataCollectorInfo={dc}
            >
              <Popup>
                <div className={styles.popup}>
                  <div className={styles.popupContent}>
                    {dc.displayName ?? ""}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        <ScaleControl imperial={false}></ScaleControl>
      </MapContainer>
    )
  );
};
