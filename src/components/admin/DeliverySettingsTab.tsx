import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  InputAdornment,
  Alert,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import type { DeliverySettings } from '../../types';

interface DeliverySettingsTabProps {
  deliverySettings: DeliverySettings;
  onSave: (settings: DeliverySettings) => void;
}

const DeliverySettingsTab: React.FC<DeliverySettingsTabProps> = ({
  deliverySettings,
  onSave,
}) => {
  const [form, setForm] = useState<DeliverySettings>(deliverySettings);

  useEffect(() => {
    setForm(deliverySettings);
  }, [deliverySettings]);

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Podešavanja dostave
      </Typography>
      
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              type="number"
              label="Cena po kilometru (RSD)"
              value={form.pricePerKm}
              onChange={(e) => setForm({ ...form, pricePerKm: Number(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">RSD/km</InputAdornment>,
              }}
              helperText="Cena dostave se računa na osnovu udaljenosti od prodavnice"
            />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Minimalna cena dostave"
                value={form.minDeliveryFee}
                onChange={(e) => setForm({ ...form, minDeliveryFee: Number(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                type="number"
                label="Maksimalna cena dostave"
                value={form.maxDeliveryFee}
                onChange={(e) => setForm({ ...form, maxDeliveryFee: Number(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                }}
              />
            </Stack>
            
            <TextField
              fullWidth
              type="number"
              label="Besplatna dostava za porudžbine iznad"
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
              }}
              helperText="Unesite 0 da isključite besplatnu dostavu"
            />
            
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Primer:</strong> Za udaljenost od 5 km, cena dostave će biti{' '}
                {Math.min(Math.max(5 * form.pricePerKm, form.minDeliveryFee), form.maxDeliveryFee)} RSD
                {form.freeDeliveryThreshold > 0 && (
                  <>, osim za porudžbine iznad {form.freeDeliveryThreshold} RSD (besplatna dostava)</>
                )}
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              onClick={handleSave}
              startIcon={<LocalShippingIcon />}
            >
              Sačuvaj podešavanja
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DeliverySettingsTab;
