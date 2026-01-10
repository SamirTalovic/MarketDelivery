import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress, TextField, InputAdornment, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import type { CustomerLocation } from '../types';

// Store location (HARI-M prodavnica)
const STORE_LOCATION = { lat: 43.276415, lng: 20.011664 };
const MAX_DISTANCE_KM = 3.5;

interface LocationPickerProps {
  value?: CustomerLocation;
  onChange: (location: CustomerLocation) => void;
  error?: boolean;
  helperText?: string;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, error, helperText }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [warning, setWarning] = useState('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    value || STORE_LOCATION
  );
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Distance calculator
  const calculateDistance = useCallback((lat: number, lng: number): number => {
    const R = 6371;
    const dLat = (lat - STORE_LOCATION.lat) * Math.PI / 180;
    const dLon = (lng - STORE_LOCATION.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(STORE_LOCATION.lat * Math.PI / 180) *
      Math.cos(lat * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const getEstimatedTime = useCallback((lat: number, lng: number) => {
    const distance = calculateDistance(lat, lng);
    const base = Math.max(15, Math.round((distance / 30) * 60));
    return { min: base, max: base + 15 };
  }, [calculateDistance]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
        { headers: { 'Accept-Language': 'sr,en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch {
      return `${lat}, ${lng}`;
    }
  };

  // Autocomplete search
  const fetchAddressSuggestions = async (query: string) => {
    if (!query.trim()) return setSuggestions([]);

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Serbia')}&addressdetails=1&limit=5`,
        { headers: { 'Accept-Language': 'sr,en' } }
      );
      const results: GeocodingResult[] = await res.json();
      setSuggestions(results);
    } finally {
      setLoading(false);
    }
  };

  // Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setWarning('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length > 2) {
      debounceRef.current = setTimeout(() => fetchAddressSuggestions(query), 500);
    } else {
      setSuggestions([]);
    }
  };

  // ✔ Restrict suggestions
  const handleSelectSuggestion = async (s: GeocodingResult) => {
    setWarning('');
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);

    

    const selected: CustomerLocation = { lat, lng, address: s.display_name };
    onChange(selected);
    setMapCenter({ lat, lng });
    setSuggestions([]);
    setSearchQuery(s.display_name);
  };

  // Map click restriction
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'mapClick') {
        const { lat, lng } = event.data;
        const dist = calculateDistance(lat, lng);

        if (dist > MAX_DISTANCE_KM) {
          setWarning(`❌ Previše daleko (${dist.toFixed(2)} km). Zona dostave max 3.5 km.`);
          return;
        }

        const address = await reverseGeocode(lat, lng);
        onChange({ lat, lng, address });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onChange, calculateDistance]);

  // GPS restriction
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = calculateDistance(lat, lng);

      if (dist > MAX_DISTANCE_KM) {
        setLoading(false);
        setWarning(`❌ GPS lokacija izvan zone (${dist.toFixed(2)} km).`);
        return;
      }

      const address = await reverseGeocode(lat, lng);
      onChange({ lat, lng, address });
      setMapCenter({ lat, lng });
      setLoading(false);
    });
  };

  const getMapUrl = () => {
    const lat = value?.lat || mapCenter.lat;
    const lng = value?.lng || mapCenter.lng;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  };

  const distance = value ? calculateDistance(value.lat, value.lng) : null;
  const estimatedTime = value ? getEstimatedTime(value.lat, value.lng) : null;

  return (
    <Box sx={{ mt: 2, position: 'relative' }}>
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Izaberite lokaciju dostave
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, position: 'relative' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Pretražite adresu..."
          value={searchQuery}
          onChange={handleSearchChange}
          error={error && !value}
          helperText={!value && helperText}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end"><CircularProgress size={20} /></InputAdornment>
            ),
          }}
        />

        <Box
          onClick={handleGetCurrentLocation}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1,
            cursor: 'pointer', '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <MyLocationIcon />
        </Box>

        {suggestions.length > 0 && (
          <Box sx={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            bgcolor: 'white', border: '1px solid #ddd', borderRadius: 1,
            zIndex: 50, maxHeight: 200, overflowY: 'auto'
          }}>
            {suggestions.map((s, i) => (
              <Box
                key={i}
                onClick={() => handleSelectSuggestion(s)}
                sx={{
                  p: 1, cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' }
                }}
              >
                {s.display_name}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {warning && (
        <Typography sx={{ color: 'red', fontWeight: 600, mb: 1 }}>
          {warning}
        </Typography>
      )}

      <Box sx={{
        height: 250, borderRadius: 2, overflow: 'hidden',
        border: '2px solid', borderColor: error && !value ? 'error.main' : 'primary.main',
        position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        {loading && (
          <Box sx={{
            position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <CircularProgress />
          </Box>
        )}
        <iframe ref={iframeRef} width="100%" height="100%" frameBorder="0" scrolling="no" src={getMapUrl()} />
      </Box>

      {value && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <LocationOnIcon color="primary" fontSize="small" />
            <Typography variant="body2" sx={{ flex: 1 }}>{value.address}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {distance !== null && <Chip size="small" label={`📍 ${distance.toFixed(1)} km`} />}
            {estimatedTime && (
              <Chip size="small" color="primary" label={`⏱ ${estimatedTime.min}-${estimatedTime.max} min`} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LocationPicker;
