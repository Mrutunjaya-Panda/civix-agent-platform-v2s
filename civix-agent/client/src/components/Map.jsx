/**
 * Map.jsx — React-Leaflet map component
 * Uses CartoDB dark tiles  + Leaflet.markercluster
 * Centered on Master Canteen Square, Bhubaneswar (20.2961°N, 85.8245°E)
 */
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

// ── Fix Leaflet default icon broken images in Vite ─────────────────────────
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

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

      let bgColor = '#10b981'; // emerald-500 (Low)
      let borderColor = '#059669'; // emerald-600
      let shadowColor = 'rgba(16, 185, 129, 0.4)';
      
      if (ticket.status === 'resolved') {
        bgColor = '#94a3b8'; // slate-400
        borderColor = '#64748b'; // slate-500
        shadowColor = 'transparent';
      } else if (ticket.severity >= 7) {
        bgColor = '#f43f5e'; // rose-500 (High)
        borderColor = '#e11d48'; // rose-600
        shadowColor = 'rgba(244, 63, 94, 0.6)';
      } else if (ticket.severity >= 4) {
        bgColor = '#f59e0b'; // amber-500 (Medium)
        borderColor = '#d97706'; // amber-600
        shadowColor = 'rgba(245, 158, 11, 0.5)';
      }

      const html = `
        <div style="
          background-color: ${bgColor};
          border: 2px solid ${borderColor};
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 15px ${shadowColor};
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.2)';" onmouseout="this.style.transform='scale(1)';"></div>
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
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer
        center={BHUBANESWAR_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={true}
      >
        <ZoomControl position="bottomright" />
        {/* CartoDB Dark Matter tiles */}
        <TileLayer
          //url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_BASEMAP_KEY}`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Marker cluster layer */}
        <MarkerClusterLayer tickets={tickets} onMarkerClick={onMarkerClick} />
      </MapContainer>

      {/* Map overlay — city label */}
      <div className="absolute top-24 left-6 z-[1000] bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-xl px-4 py-2 shadow-xl pointer-events-none">
        <span className="text-slate-400 text-xs font-mono tracking-wider flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          BHUBANESWAR, ODISHA
        </span>
      </div>
    </div>
  )
}
