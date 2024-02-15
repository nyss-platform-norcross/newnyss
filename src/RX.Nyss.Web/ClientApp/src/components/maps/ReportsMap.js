import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ScaleControl, useMap } from 'react-leaflet';
import { calculateBounds, calculateCenter, calculateIconSize } from '../../utils/map';
import { TextIcon } from "../common/map/MarkerIcon";
import { MarkerClusterComponent } from "./MarkerClusterComponent";

export const ReportsMap = ({ data, details, detailsFetching, onMarkerClick }) => {
  const [bounds, setBounds] = useState(null);
  const [center, setCenter] = useState(null);
  const [totalReports, setTotalReports] = useState(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setTotalReports(data.reduce((a, d) => a + d.reportsCount, 0));

    setBounds(data.length > 1 ? calculateBounds(data) : null)
    setCenter(data.length > 1 ? null : calculateCenter(data.map(l => ({ lat: l.location.latitude, lng: l.location.longitude }))));
  }, [data]);

  // Re-center map when the center useState changes or map is rendered in.
  const CenterMapController = (center) => {
    const map = useMap();
    
    useEffect(() => {
      if (center) {
        map.setView(center.center);
      }
    }, [center, map]);

    // Returns null such that it can be rendered as a react component.
    return null;
  }

  const createClusterIcon = (cluster) => {
    const count = cluster.getAllChildMarkers().reduce((sum, item) => item.options.reportsCount + sum, 0);
    return new TextIcon({
      size: calculateIconSize(count, totalReports),
      text: count
    });
  }

  const createIcon = (count) => {
    return new TextIcon({
      size: calculateIconSize(count, totalReports),
      text: count
    });
  }

  const handleMarkerClick = e =>
    onMarkerClick(e.latlng.lat, e.latlng.lng);

  return (!!center || !!bounds) && (
    <MapContainer
      style={{ height: "500px" }}
      zoom={5}
      bounds={bounds}
      center={center}
      scrollWheelZoom={false}
      maxZoom={19}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterComponent
        data={data}
        details={details}
        detailsFetching={detailsFetching}
        createIcon={createIcon}
        createClusterIcon={createClusterIcon}
        handleMarkerClick={handleMarkerClick}
      />

      <ScaleControl imperial={false}></ScaleControl>
      {/* CenterMapController must be added as a component since the useMap hook must be initialized inside a MapContainer.*/}
      <CenterMapController center={center} />
    </MapContainer>
  );
}
