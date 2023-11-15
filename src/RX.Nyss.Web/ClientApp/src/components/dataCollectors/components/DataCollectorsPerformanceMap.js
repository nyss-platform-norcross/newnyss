import styles from "./DataCollectorsPerformanceMap.module.scss"
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Marker, ScaleControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { Loading } from "../../common/loading/Loading";
import { Icon } from "@material-ui/core";
import { calculateBounds } from "../../../utils/map";
import { SignIcon } from "../../common/map/MarkerIcon";
import { getIconFromStatus } from "../logic/dataCollectorsService";
import { performanceStatus } from "../logic/dataCollectorsConstants";

const createClusterIcon = (cluster) => {
  const data = cluster.getAllChildMarkers().map(m => m.options.dataCollectorInfo);

  const aggregatedData = {
    countReportingCorrectly: data.some(d => d.countReportingCorrectly),
    countReportingWithErrors: data.some(d => d.countReportingWithErrors),
    countNotReporting: data.some(d => d.countNotReporting)
  }

  const status = getAggregatedStatus(aggregatedData);

  return new SignIcon({
    icon: getIconFromStatus(status),
    className: styles[`marker_${status}`],
    size: 40,
    multiple: true
  });
}

const createIcon = (info) => {
  const status = getAggregatedStatus(info);

  return new SignIcon({
    icon: getIconFromStatus(status),
    className: styles[`marker_${status}`],
    size: 40
  });
}

const getAggregatedStatus = (info) => {
  if (info.countReportingWithErrors) {
    return performanceStatus.reportingWithErrors;
  }

  if (info.countNotReporting) {
    return performanceStatus.notReporting;
  }

  return performanceStatus.reportingCorrectly;
}

export const DataCollectorsPerformanceMap = ({ centerLocation, dataCollectorLocations, projectId, details, getMapDetails, detailsFetching }) => {
  const [center, setCenter] = useState(null);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const hasLocations = dataCollectorLocations.length > 0;
    setCenter(hasLocations ? { lat: centerLocation.latitude, lng: centerLocation.longitude }: null);
    setBounds(hasLocations ? calculateBounds(dataCollectorLocations) : null);
  }, [dataCollectorLocations, centerLocation]);

  const handleMarkerClick = e =>
    getMapDetails(projectId, e.latlng.lat, e.latlng.lng);

  const combineStatus = (dataCollectorList, dc) => {
    let current = dataCollectorList[0];
    current.countNotReporting += dc.countNotReporting;
    current.countReportingWithErrors += dc.countReportingWithErrors;
    current.countReportingCorrectly += dc.countReportingCorrectly;
    return [current];
  }

  const distinctLocations = (dataCollectors) =>
    dataCollectors.reduce((a, c) => a.some(dc => dc.location.latitude === c.location.latitude && dc.location.longitude === c.location.longitude) ? combineStatus(a, c) : [...a, c], []);

  return (!!center || !!bounds) && (
    <MapContainer
      center={center}
      length={4}
      bounds={bounds}
      zoom={5}
      maxZoom={19}
      className={styles.map}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MarkerClusterGroup
        showCoverageOnHover={false}
        iconCreateFunction={createClusterIcon}>
        {distinctLocations(dataCollectorLocations).map((dc, i) => (
          <Marker
            className={`${styles.marker} ${dc.countNotReporting || dc.countReportingWithErrors ? styles.markerInvalid : styles.markerValid}`}
            key={`marker_${i}`}
            position={{ lat: dc.location.latitude, lng: dc.location.longitude }}
            icon={createIcon(dc)}
            eventHandlers={{
              click: handleMarkerClick
            }}
            dataCollectorInfo={dc}
          >
            <Popup>
              <div className={styles.popup}>
                {!detailsFetching
                  ? (
                    <div>
                      {details && details.map(d => (
                        <div key={`dataCollector_${d.id}`} className={styles.dataCollectorDetails}>
                          <Icon>{getIconFromStatus(d.status)}</Icon>
                          {d.displayName}
                        </div>
                      ))}
                    </div>
                  )
                  : (<Loading inline noWait />)
                }
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      <ScaleControl imperial={false}></ScaleControl>
    </MapContainer>
  );
}
