import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Red Icon for complaints
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapView = () => {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // Fetch complaints with a large radius to cover India (5000km)
      const res = await api.get('/complaints?lat=20.5937&lng=78.9629&max_distance=5000000&limit=100');
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 150px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {complaints.map(complaint => (
          <Marker 
            key={complaint._id} 
            position={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}
            icon={redIcon}
          >
            <Popup>
              <div style={{ padding: '0.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{complaint.title}</h4>
                <p style={{ fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{complaint.location_text}</p>
                <button 
                  onClick={() => navigate('/dashboard/map')}
                  style={{ 
                    background: 'var(--primary)', color: 'white', border: 'none', 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                    width: '100%', fontWeight: 'bold'
                  }}
                >
                  View in Feed
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
