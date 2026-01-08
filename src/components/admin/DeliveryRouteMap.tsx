import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Box, Typography, Chip, Stack, Button, CircularProgress } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import NavigationIcon from '@mui/icons-material/Navigation';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import StoreIcon from '@mui/icons-material/Store';

// Store location (HARI-M prodavnica) - used as fallback
const STORE_LOCATION = { lat: 43.276415, lng: 20.011664 };

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DeliveryRouteMapProps {
  customerLat: number;
  customerLng: number;
  customerName: string;
  customerAddress: string;
}

const DeliveryRouteMap: React.FC<DeliveryRouteMapProps> = ({
  customerLat,
  customerLng,
  customerName,
  customerAddress,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  
  const [routeInfo, setRouteInfo] = useState<{ distance: number; time: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Get the starting position (driver position if tracking, otherwise store)
  const startPosition = driverPosition || STORE_LOCATION;
console.log(startPosition)
  // Update route when driver position changes
  const updateRoute = useCallback((fromLat: number, fromLng: number) => {
    if (!routingControlRef.current) return;
    
    routingControlRef.current.setWaypoints([
      L.latLng(fromLat, fromLng),
      L.latLng(customerLat, customerLng),
    ]);
  }, [customerLat, customerLng]);

  // Update driver marker position
  const updateDriverMarker = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    const driverIcon = L.divIcon({
      html: `<div style="background: #FF5722; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); border: 3px solid white; animation: pulse 2s infinite;">🚗</div>`,
      className: 'driver-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([lat, lng]);
    } else {
      driverMarkerRef.current = L.marker([lat, lng], { icon: driverIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>🚗 Vozač</b><br/>Vaša trenutna lokacija');
    }
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS nije podržan na ovom uređaju');
      return;
    }

    setIsLoadingGps(true);
    setGpsError(null);

    // First get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverPosition({ lat: latitude, lng: longitude });
        updateDriverMarker(latitude, longitude);
        updateRoute(latitude, longitude);
        setIsLoadingGps(false);
        setIsTracking(true);

        // Then start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setDriverPosition({ lat, lng });
            updateDriverMarker(lat, lng);
            updateRoute(lat, lng);
            
            // Pan map to show driver
            if (mapInstanceRef.current) {
              const bounds = L.latLngBounds(
                [lat, lng],
                [customerLat, customerLng]
              );
              mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
          },
          (error) => {
            console.error('GPS error:', error);
            setGpsError('Greška pri praćenju GPS-a');
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000,
          }
        );
      },
      (error) => {
        console.error('GPS error:', error);
        setIsLoadingGps(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('GPS pristup je odbijen');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Lokacija nije dostupna');
            break;
          case error.TIMEOUT:
            setGpsError('Isteklo vreme za GPS');
            break;
          default:
            setGpsError('Greška pri dobijanju lokacije');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [customerLat, customerLng, updateDriverMarker, updateRoute]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsTracking(false);
    setDriverPosition(null);
    
    // Remove driver marker
    if (driverMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(driverMarkerRef.current);
      driverMarkerRef.current = null;
    }
    
    // Reset route to store
    updateRoute(STORE_LOCATION.lat, STORE_LOCATION.lng);
  }, [updateRoute]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [(STORE_LOCATION.lat + customerLat) / 2, (STORE_LOCATION.lng + customerLng) / 2],
      zoom: 13,
    });

    mapInstanceRef.current = map;

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom store icon
    const storeIcon = L.divIcon({
      html: `<div style="background: #2E7D32; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); border: 3px solid white;">🏪</div>`,
      className: 'custom-div-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Custom customer icon
    const customerIcon = L.divIcon({
      html: `<div style="background: #1976D2; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); border: 3px solid white;">📍</div>`,
      className: 'custom-div-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Add store marker
    L.marker([STORE_LOCATION.lat, STORE_LOCATION.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup('<b>🏪 HARI-M Prodavnica</b><br/>Početna lokacija');

    // Add customer marker
    L.marker([customerLat, customerLng], { icon: customerIcon })
      .addTo(map)
      .bindPopup(`<b>📍 ${customerName}</b><br/>${customerAddress}`);

    // Add routing control
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(STORE_LOCATION.lat, STORE_LOCATION.lng),
        L.latLng(customerLat, customerLng),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [
          { color: '#2E7D32', opacity: 0.8, weight: 6 },
          { color: '#4CAF50', opacity: 1, weight: 4 },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      createMarker: () => null,
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Listen for route found event
    routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        setRouteInfo({
          distance: route.summary.totalDistance / 1000,
          time: Math.round(route.summary.totalTime / 60),
        });
      }
    });

    // Fit bounds
    const bounds = L.latLngBounds(
      [STORE_LOCATION.lat, STORE_LOCATION.lng],
      [customerLat, customerLng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(255, 87, 34, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
      document.head.removeChild(style);
    };
  }, [customerLat, customerLng, customerName, customerAddress]);

  return (
    <Box>
      {/* Route info chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        {isTracking ? (
          <Chip
            icon={<NavigationIcon />}
            label="Vozač"
            color="warning"
            size="small"
          />
        ) : (
          <Chip
            icon={<StoreIcon />}
            label="HARI-M"
            color="success"
            variant="outlined"
            size="small"
          />
        )}
        <Chip
          icon={<DirectionsIcon />}
          label="→"
          size="small"
          sx={{ bgcolor: 'grey.100' }}
        />
        <Chip
          icon={<PersonPinIcon />}
          label={customerName}
          color="primary"
          variant="outlined"
          size="small"
        />
        {routeInfo && (
          <>
            <Chip
              icon={<DirectionsIcon />}
              label={`${routeInfo.distance.toFixed(1)} km`}
              color="info"
              size="small"
            />
            <Chip
              icon={<AccessTimeIcon />}
              label={`~${routeInfo.time} min`}
              color="warning"
              size="small"
            />
          </>
        )}
      </Stack>

      {/* GPS Tracking Button */}
      <Box sx={{ mb: 2 }}>
        {!isTracking ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={isLoadingGps ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
            onClick={startTracking}
            disabled={isLoadingGps}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            {isLoadingGps ? 'Dobijanje lokacije...' : 'Pokreni navigaciju'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            startIcon={<GpsFixedIcon />}
            onClick={stopTracking}
            fullWidth
            sx={{ borderRadius: 2 }}
          >
            Zaustavi praćenje
          </Button>
        )}
        {gpsError && (
          <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
            {gpsError}
          </Typography>
        )}
      </Box>

      {/* Map container */}
      <Box
        ref={mapRef}
        sx={{
          height: 300,
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: isTracking ? 'warning.main' : 'primary.main',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          '& .leaflet-routing-container': {
            display: 'none !important',
          },
        }}
      />

      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: 'center' }} flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          🏪 Prodavnica
        </Typography>
        {isTracking && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🚗 Vozač
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          📍 Kupac
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 20, height: 3, bgcolor: '#4CAF50', borderRadius: 1 }} /> Ruta
        </Typography>
      </Stack>
    </Box>
  );
};

export default DeliveryRouteMap;
