/**
 * Map.jsx — React-Leaflet map component
 * Uses CartoDB dark tiles (no API key required) + Leaflet.markercluster
 * Centered on Master Canteen Square, Bhubaneswar (20.2961°N, 85.8245°E)
 */
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

// ── Fix Leaflet default icon broken images in Vite ─────────────────────────
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

// ── Bhubaneswar center coordinates ────────────────────────────────────────────
const BHUBANESWAR_CENTER = [20.2961, 85.8245]
const DEFAULT_ZOOM = 14

// ── MarkerCluster initializer (inner component, has access to map instance) ──
function MarkerClusterLayer({ tickets, onMarkerClick }) {
  const map = useMap()
  const clusterRef = useRef(null)

  useEffect(() => {
    // Initialize cluster group
    if (!clusterRef.current) {
      clusterRef.current = L.markerClusterGroup({
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount()
          const size = count < 5 ? 'small' : count < 15 ? 'medium' : 'large'
          return L.divIcon({
            html: `<div class="civix-cluster civix-cluster-${size}">${count}</div>`,
            className: '',
            iconSize: L.point(40, 40),
          })
        },
        maxClusterRadius: 60,
        zoomToBoundsOnClick: true,
        showCoverageOnHover: false,
      })
      map.addLayer(clusterRef.current)
    }

    // Clear existing markers
    clusterRef.current.clearLayers()

    // Add markers for all tickets
    tickets.forEach((ticket) => {
      if (!ticket.location || !ticket.location.lat || !ticket.location.lng) return;

      // Determine pin color based on severity and status
      let bgColor = '#22c55e'; // Green (Low)
      let borderColor = '#14532d';
      
      if (ticket.status === 'resolved') {
        bgColor = '#64748b'; // Grey
        borderColor = '#334155';
      } else if (ticket.severity >= 7) {
        bgColor = '#ef4444'; // Red (High)
        borderColor = '#7f1d1d';
      } else if (ticket.severity >= 4) {
        bgColor = '#eab308'; // Yellow (Medium)
        borderColor = '#713f12';
      }

      const html = `
        <div style="
          background-color: ${bgColor};
          border: 2px solid ${borderColor};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          box-shadow: 0 0 10px ${bgColor}80;
        "></div>
      `;

      const customIcon = L.divIcon({
        html,
        className: '',
        iconSize: L.point(20, 20),
        iconAnchor: L.point(10, 10)
      });

      const marker = L.marker([ticket.location.lat, ticket.location.lng], { icon: customIcon })
      
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(ticket);
      });

      clusterRef.current.addLayer(marker)
    });

    return () => {
      // We don't want to recreate the cluster group entirely on every re-render,
      // but we do want to clear layers. We'll leave the group on the map.
    }
  }, [map, tickets, onMarkerClick])

  return null
}

// ── Main Map component ────────────────────────────────────────────────────────
export default function Map({ tickets = [], onMarkerClick }) {
  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative' }}>
      <MapContainer
        center={BHUBANESWAR_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        {/* CartoDB Dark Matter tiles — no API key, free for hackathons */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Marker cluster layer */}
        <MarkerClusterLayer tickets={tickets} onMarkerClick={onMarkerClick} />
      </MapContainer>

      {/* Map overlay — city label */}
      <div style={{
        position: 'absolute', bottom: 32, left: 16, zIndex: 1000,
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8, padding: '6px 12px',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>
          📍 Bhubaneswar, Odisha
        </span>
      </div>
    </div>
  )
}
