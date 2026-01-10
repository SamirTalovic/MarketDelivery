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
  Chip,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
      
      <Stack spacing={3} sx={{ maxWidth: 700 }}>
        {/* Current Delivery Prices Summary */}
        <Card sx={{ bgcolor: 'primary.50', border: '2px solid', borderColor: 'primary.main' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="primary" />
              Pregled cena dostave
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography>Porudžbine ispod {form.freeDeliveryThreshold} RSD (do {form.distanceThresholdKm} km):</Typography>
                <Chip label={`${form.underThresholdFee} RSD`} color="warning" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography>Porudžbine ispod {form.freeDeliveryThreshold} RSD (preko {form.distanceThresholdKm} km):</Typography>
                <Chip label={`${form.overDistanceFee} RSD`} color="error" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography>Porudžbine iznad {form.freeDeliveryThreshold} RSD:</Typography>
                <Chip label="BESPLATNA" color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography>Radno vreme za porudžbine:</Typography>
                </Box>
                <Chip label={`${form.orderStartHour}:00 - ${form.orderEndHour}:00`} color="info" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Podešavanja cena
            </Typography>
            <Stack spacing={3}>
              <TextField
                fullWidth
                type="number"
                label="Besplatna dostava za porudžbine iznad"
                value={form.freeDeliveryThreshold}
                onChange={(e) => setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                }}
                helperText="Porudžbine iznad ovog iznosa imaju besplatnu dostavu"
              />
              
              <TextField
                fullWidth
                type="number"
                label="Cena dostave za porudžbine ispod praga (do granice udaljenosti)"
                value={form.underThresholdFee}
                onChange={(e) => setForm({ ...form, underThresholdFee: Number(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                }}
                helperText="Cena za porudžbine koje su ispod praga za besplatnu dostavu i u okviru granice udaljenosti"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Granica udaljenosti"
                  value={form.distanceThresholdKm}
                  onChange={(e) => setForm({ ...form, distanceThresholdKm: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">km</InputAdornment>,
                  }}
                  helperText="Preko ove udaljenosti primenjuje se veća cena dostave"
                  inputProps={{ step: 0.5 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Cena za udaljenije porudžbine"
                  value={form.overDistanceFee}
                  onChange={(e) => setForm({ ...form, overDistanceFee: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">RSD</InputAdornment>,
                  }}
                  helperText="Cena dostave za porudžbine preko granice udaljenosti"
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Time Restrictions */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon />
              Radno vreme za porudžbine
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Početak primanja porudžbina"
                value={form.orderStartHour}
                onChange={(e) => setForm({ ...form, orderStartHour: Math.min(23, Math.max(0, Number(e.target.value))) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">:00</InputAdornment>,
                }}
                inputProps={{ min: 0, max: 23 }}
                helperText="Sat od kog se primaju porudžbine"
              />
              <TextField
                fullWidth
                type="number"
                label="Kraj primanja porudžbina"
                value={form.orderEndHour}
                onChange={(e) => setForm({ ...form, orderEndHour: Math.min(24, Math.max(1, Number(e.target.value))) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">:00</InputAdornment>,
                }}
                inputProps={{ min: 1, max: 24 }}
                helperText="Sat do kog se primaju porudžbine"
              />
            </Stack>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Porudžbine van radnog vremena ({form.orderStartHour}:00 - {form.orderEndHour}:00) neće moći da se pošalju.
            </Alert>
          </CardContent>
        </Card>

        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          startIcon={<LocalShippingIcon />}
        >
          Sačuvaj podešavanja
        </Button>
      </Stack>
    </Box>
  );
};

export default DeliverySettingsTab;
