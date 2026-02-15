import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

const MapPicker = ({ latitude, longitude, onLocationSelect }) => {
    const [position, setPosition] = useState(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );

    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
        onLocationSelect(newPosition.lat, newPosition.lng);
    };

    // Default center: Indonesia (Jakarta)
    const defaultCenter = position || { lat: -6.2088, lng: 106.8456 };

    return (
        <div style={{
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '300px'
        }}>
            <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={position ? 15 : 5}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
        </div>
    );
};

export default MapPicker;
