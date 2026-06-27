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
function MarkerClusterLayer({ tickets }) {
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

    // Add a placeholder marker at Bhubaneswar center (Phase 2+ will add real ticket pins)
    const placeholderMarker = L.marker(BHUBANESWAR_CENTER)
      .bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 160px;">
          <strong style="color: #6366f1;">CivixAgent</strong><br/>
          <small style="color: #64748b;">Master Canteen Square</small><br/>
          <small style="color: #64748b;">Bhubaneswar, Odisha</small>
        </div>
      `, { maxWidth: 250 })

    clusterRef.current.addLayer(placeholderMarker)

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
        clusterRef.current = null
      }
    }
  }, [map, tickets])

  return null
}

// ── Main Map component ────────────────────────────────────────────────────────
export default function Map({ tickets = [] }) {
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
        <MarkerClusterLayer tickets={tickets} />
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
