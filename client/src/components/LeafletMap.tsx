import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface LeafletMapProps {
    address: string;
    height?: string;
    width?: string;
}

interface Coordinates {
    lat: number;
    lng: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
    address,
    height = '300px',
    width = '100%'
}) => {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const geocodeAddress = async () => {
            try {
                setLoading(true);
                setError(null);

                // Use OpenStreetMap Nominatim geocoding service (free)
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
                );

                if (!response.ok) {
                    throw new Error('Geocoding service unavailable');
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    setCoordinates({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    });
                } else {
                    // Fallback to a default location (e.g., city center)
                    setCoordinates({
                        lat: 40.7128, // New York City
                        lng: -74.0060
                    });
                    setError('Location not found, showing approximate area');
                }
            } catch (err) {
                console.error('Geocoding error:', err);
                setError('Unable to load map location');
                // Set a default fallback location
                setCoordinates({
                    lat: 40.7128,
                    lng: -74.0060
                });
            } finally {
                setLoading(false);
            }
        };

        if (address) {
            geocodeAddress();
        }
    }, [address]);

    if (loading) {
        return (
            <div style={{
                width,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                color: '#6c757d'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>&#128506;</div>
                    <div>Loading map...</div>
                </div>
            </div>
        );
    }

    if (error && !coordinates) {
        return (
            <div style={{
                width,
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                color: '#6c757d'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>&# 128205;</div>
                    <div>Map unavailable</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{address}</div>
                </div>
            </div>
        );
    }

    if (!coordinates) {
        return null;
    }

    return (
        <div style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}>
            {error && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '0.5rem',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    borderBottom: '1px solid #ffeaa7'
                }}>
                    {error}
                </div>
            )}
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={15}
                style={{
                    height: error ? `calc(${height} - 40px)` : height,
                    width: '100%'
                }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                        <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                            <strong>{address}</strong>
                            <br />
                            <small>Event Location</small>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default LeafletMap;
