import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';

// Store location (HARI-M prodavnica - Niš, Serbia)
const STORE_LOCATION = { lat: 43.3209, lng: 21.8958 };

interface DeliveryMapProps {
  address?: string;
  estimatedMinutes?: number;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ address, estimatedMinutes = 30 }) => {
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
      const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Geocode address using Nominatim API
  const geocodeAddress = async (searchAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchQuery = `${searchAddress}, Serbia`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'sr,en',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Greška pri pretrazi lokacije');
      }
      
      const results: GeocodingResult[] = await response.json();
      
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        setDeliveryLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setDisplayName(display_name);
        startDeliveryAnimation();
      } else {
        setError('Lokacija nije pronađena. Pokušajte sa preciznijom adresom.');
        setDeliveryLocation(null);
      }
    } catch (err) {
      setError('Greška pri pronalaženju lokacije');
      setDeliveryLocation(null);
    } finally {
      setLoading(false);
    }
  };

  // Debounced geocoding
  useEffect(() => {
    if (address && address.trim().length > 5) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        geocodeAddress(address);
      }, 800);
    } else {
      setDeliveryLocation(null);
      setDisplayName('');
      setAnimationProgress(0);
      setIsAnimating(false);
    }
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [address]);

  // Start delivery animation
  const startDeliveryAnimation = () => {
    setAnimationProgress(0);
    setIsAnimating(true);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startTime = Date.now();
    const duration = 4000;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setAnimationProgress(easeProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate distance in km
  const calculateDistance = (): number => {
    if (!deliveryLocation) return 0;
    
    const R = 6371;
    const dLat = (deliveryLocation.lat - STORE_LOCATION.lat) * Math.PI / 180;
    const dLon = (deliveryLocation.lng - STORE_LOCATION.lng) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(STORE_LOCATION.lat * Math.PI / 180) * Math.cos(deliveryLocation.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate estimated time based on distance
  const getEstimatedTime = (): { min: number; max: number } => {
    const distance = calculateDistance();
    const baseTime = Math.max(15, Math.round((distance / 30) * 60));
    return {
      min: baseTime,
      max: baseTime + 15,
    };
  };

  const distance = calculateDistance();
  const estimatedTime = deliveryLocation ? getEstimatedTime() : { min: estimatedMinutes, max: estimatedMinutes + 15 };

  // Generate OpenStreetMap embed URL
  const getMapUrl = () => {
    if (deliveryLocation) {
      // Show both store and delivery location
      return `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(STORE_LOCATION.lng, deliveryLocation.lng) - 0.01},${Math.min(STORE_LOCATION.lat, deliveryLocation.lat) - 0.01},${Math.max(STORE_LOCATION.lng, deliveryLocation.lng) + 0.01},${Math.max(STORE_LOCATION.lat, deliveryLocation.lat) + 0.01}&layer=mapnik&marker=${deliveryLocation.lat},${deliveryLocation.lng}`;
    }
    // Show only store location
    return `https://www.openstreetmap.org/export/embed.html?bbox=${STORE_LOCATION.lng - 0.02},${STORE_LOCATION.lat - 0.02},${STORE_LOCATION.lng + 0.02},${STORE_LOCATION.lat + 0.02}&layer=mapnik&marker=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`;
  };

  return (
    <Box sx={{ mt: 3 }}>
      {/* Delivery info card */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2,
          p: 2,
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          borderRadius: 3,
          color: 'white',
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocalShippingIcon 
            sx={{ 
              fontSize: 40,
              animation: isAnimating ? 'bounce 0.5s infinite alternate' : 'none',
              '@keyframes bounce': {
                '0%': { transform: 'translateY(0)' },
                '100%': { transform: 'translateY(-5px)' },
              },
            }} 
          />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Procenjeno vreme dostave
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" />
              <Typography variant="h5" fontWeight={700}>
                {loading ? '...' : `${estimatedTime.min} - ${estimatedTime.max} min`}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {deliveryLocation && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: { xs: 1, sm: 0 }, ml: { sm: 'auto' } }}>
            <Chip 
              icon={<DirectionsIcon sx={{ color: 'white !important' }} />} 
              label={`${distance.toFixed(1)} km`}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600,
              }}
            />
            {isAnimating && (
              <Chip 
                icon={<LocalShippingIcon sx={{ color: 'white !important' }} />} 
                label={`Dostava: ${Math.round(animationProgress * 100)}%`}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                  },
                }}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Delivery animation bar */}
      {deliveryLocation && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1,
          }}>
            <Typography variant="body2" color="text.secondary">🏪 HARI-M</Typography>
            <Typography variant="body2" color="text.secondary">📍 {address}</Typography>
          </Box>
          <Box sx={{ 
            position: 'relative',
            height: 8,
            bgcolor: 'grey.200',
            borderRadius: 4,
            overflow: 'hidden',
          }}>
            <Box sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${animationProgress * 100}%`,
              bgcolor: 'primary.main',
              borderRadius: 4,
              transition: 'width 0.1s linear',
            }} />
          </Box>
          <Box sx={{
            position: 'relative',
            height: 30,
            mt: -1,
          }}>
            <Box sx={{
              position: 'absolute',
              left: `calc(${animationProgress * 100}% - 15px)`,
              top: 0,
              fontSize: 24,
              transition: 'left 0.1s linear',
            }}>
              🚚
            </Box>
          </Box>
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {/* Map container */}
      <Box
        sx={{
          height: 300,
          borderRadius: 3,
          overflow: 'hidden',
          border: '3px solid',
          borderColor: 'primary.main',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              gap: 2,
            }}
          >
            <CircularProgress color="primary" size={50} />
            <Typography variant="body2" color="text.secondary">
              Tražim lokaciju...
            </Typography>
          </Box>
        )}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={getMapUrl()}
          style={{ border: 0 }}
          title="Mapa dostave"
        />
      </Box>

      {/* Location info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        {deliveryLocation ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              {displayName || address}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            📍 Unesite adresu za prikaz lokacije na mapi
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default DeliveryMap;