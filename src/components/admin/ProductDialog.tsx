import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import type { Category, Product } from '../../types';

interface ProductFormData {
  name: string;
  price: number;
  categoryId: number;
  available: boolean;
  addition: string;
  unit: string;
}

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  product,
  categories,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    price: 0,
    categoryId: 0,
    available: true,
    addition: '',
    unit: 'kom',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        available: product.available,
        addition: product.addition || '',
        unit: product.unit || 'kom',
      });
    } else {
      setForm({
        name: '',
        price: 0,
        categoryId: categories[0]?.categoryId || 0,
        available: true,
        addition: '',
        unit: 'kom',
      });
    }
  }, [product, categories, open]);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Izmeni artikal' : 'Novi artikal'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Naziv artikla"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Dodatak/Opis (opciono)"
            value={form.addition}
            onChange={(e) => setForm({ ...form, addition: e.target.value })}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              type="number"
              label="Cena (RSD)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>Jedinica</InputLabel>
              <Select
                value={form.unit}
                label="Jedinica"
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <MenuItem value="kom">kom</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="l">l</MenuItem>
                <MenuItem value="g">g</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <FormControl fullWidth>
            <InputLabel>Kategorija</InputLabel>
            <Select
              value={form.categoryId}
              label="Kategorija"
              onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                  {cat.emoji} {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
            }
            label="Dostupno"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Otkaži</Button>
        <Button variant="contained" onClick={handleSave}>
          Sačuvaj
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
