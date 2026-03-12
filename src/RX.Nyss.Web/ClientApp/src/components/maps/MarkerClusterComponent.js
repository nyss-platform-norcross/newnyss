import styles from "./MarkerClusterComponent.module.scss";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { stringKeys, strings } from "../../strings";

export const MarkerClusterComponent = ({
  data,
  createIcon,
  createClusterIcon,
  handleMarkerClick,
}) => {
  return (
    <MarkerClusterGroup
      maxClusterRadius={50}
      showCoverageOnHover={false}
      iconCreateFunction={createClusterIcon}
    >
      {data
        .filter((d) => d.reportsCount > 0)
        .map((point) => (
          <Marker
            key={`marker_${point.location.latitude}${point.reportsCount}`}
            position={
              point.displayPosition ?? {
                lat: point.location.latitude,
                lng: point.location.longitude,
              }
            }
            icon={createIcon(point.reportsCount)}
            reportsCount={point.reportsCount}
            eventHandlers={{
              click: (e) => {
                e.originalEvent?.stopPropagation();
                handleMarkerClick(
                  point.location.latitude,
                  point.location.longitude,
                );
              },
            }}
          >
            <Popup>
              <div
                className={styles.popup}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {point.healthRisks && point.healthRisks.length > 0 ? (
                  <div>
                    {point.healthRisks.map((h) => (
                      <div
                        className={styles.reportHealthRiskDetails}
                        key={`reportHealthRisk_${h.name}`}
                      >
                        <div>{h.name}:</div>
                        <div>
                          {h.value}{" "}
                          {strings(
                            h.value === 1
                              ? stringKeys.reportsMap.report
                              : stringKeys.reportsMap.reports,
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.reportHealthRiskDetails}>
                    <div>{point.reportsCount}</div>
                    <div>
                      {strings(
                        point.reportsCount === 1
                          ? stringKeys.reportsMap.report
                          : stringKeys.reportsMap.reports,
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
    </MarkerClusterGroup>
  );
};