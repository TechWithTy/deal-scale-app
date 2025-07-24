'use client';
import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import Lottie from 'lottie-react';

type PropertyMapProps = {
  latitude: number;
  longitude: number;
  address: string;
  details: string;
};

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const mapOptions = {
  mapTypeId: 'satellite', // Set the default map type to Satellite
  disableDefaultUI: true, // Hide default UI for a cleaner look
  zoomControl: true // Enable zoom control
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  address,
  details
}) => {
  const [selected, setSelected] = useState<google.maps.LatLngLiteral | null>({
    lat: latitude,
    lng: longitude
  });
  const [homeAnimation, setHomeAnimation] = useState<any>(null); // State to store Lottie animation data

  useEffect(() => {
    // Automatically select the marker when the component loads
    setSelected({ lat: latitude, lng: longitude });

    // Fetch Lottie animation from the public folder
    fetch('/lottie/HousePing.json')
      .then((response) => response.json())
      .then((data) => setHomeAnimation(data));
  }, [latitude, longitude]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GMAPS_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat: latitude, lng: longitude }}
        zoom={20} // Zoom level set to 20 for close-up view
        options={mapOptions}
      >
        <Marker
          position={{ lat: latitude, lng: longitude }}
          onClick={() => setSelected({ lat: latitude, lng: longitude })}
        />

        {selected && (
          <InfoWindow
            position={selected}
            onCloseClick={() => setSelected(null)} // Keep this for closing the InfoWindow when custom close button is clicked
          >
            <div
              style={{ color: 'black', display: 'flex', alignItems: 'center' }}
            >
              <Lottie
                animationData={homeAnimation}
                style={{ height: 30, width: 30, marginRight: 10 }}
              />
              <div style={{ flex: 1 }}>
                <h2
                  className="font-bold"
                  style={{ fontSize: '1rem', margin: 0 }}
                >
                  {address}
                </h2>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>{details}</p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;
