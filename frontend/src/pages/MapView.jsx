import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Shield } from 'lucide-react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // Default center: India
      const res = await api.get('/complaints?lat=20.5937&lng=78.9629&limit=100');
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Global Map</h3>
            <p style={{ color: 'var(--text-muted)' }}>Interactive visualization of community reports.</p>
         </div>
         <div className="glass" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Shield size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{complaints.length} Active Hotspots</span>
         </div>
      </div>

      <div style={{ height: 'calc(100vh - 300px)', borderRadius: '32px', overflow: 'hidden', border: '1px solid var(--border-glass)', boxShadow: 'var(--glass-shadow)' }}>
        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: '100%', width: '100%', background: '#000' }}
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
              <Popup className="premium-popup">
                <div style={{ padding: '0.5rem', minWidth: '200px' }}>
                  <div style={{ marginBottom: '1rem' }}><StatusBadge status={complaint.status} /></div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#000', fontSize: '1.1rem', fontWeight: 800 }}>{complaint.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                     <MapPin size={12} /> Verified Location
                  </div>
                  <button 
                    onClick={() => navigate(`/complaint/${complaint._id}`)}
                    style={{ 
                      background: 'var(--primary)', color: 'white', border: 'none', 
                      padding: '0.8rem 1.2rem', borderRadius: '12px', cursor: 'pointer',
                      width: '100%', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    Details <ArrowRight size={16} />
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
