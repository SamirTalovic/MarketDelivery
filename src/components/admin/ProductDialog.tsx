import React, { useState, useEffect, useRef } from 'react';
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
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { Category, Product } from '../../types';

export interface ProductFormData {
  name: string;
  price: number;
  salePrice?: number;
  categoryId: number;
  available: boolean;
  addition: string;
  unit: string;
  picture?: File;
  currentPictureUrl?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    price: 0,
    salePrice: undefined,
    categoryId: 0,
    available: true,
    addition: '',
    unit: 'kom',
    picture: undefined,
    currentPictureUrl: undefined,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSalePrice, setShowSalePrice] = useState(false);

  useEffect(() => {
    if (product) {
      const hasSalePrice = product.salePrice !== undefined && product.salePrice !== null && product.salePrice > 0;
      setForm({
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        categoryId: product.categoryId,
        available: product.available,
        addition: product.addition || '',
        unit: product.unit || 'kom',
        picture: undefined,
        currentPictureUrl: product.pictureUrl,
      });
      setPreviewUrl(product.pictureUrl || null);
      setShowSalePrice(hasSalePrice);
    } else {
      setForm({
        name: '',
        price: 0,
        salePrice: undefined,
        categoryId: categories[0]?.categoryId || 0,
        available: true,
        addition: '',
        unit: 'kom',
        picture: undefined,
        currentPictureUrl: undefined,
      });
      setPreviewUrl(null);
      setShowSalePrice(false);
    }
  }, [product, categories, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, picture: file });
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setForm({ ...form, picture: undefined, currentPictureUrl: undefined });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const dataToSave = {
      ...form,
      salePrice: showSalePrice ? form.salePrice : undefined,
    };
    onSave(dataToSave);
    onClose();
  };

  // Calculate discount percentage for preview
  const discountPercent = showSalePrice && form.salePrice && form.salePrice < form.price
    ? Math.round(((form.price - form.salePrice) / form.price) * 100)
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Izmeni artikal' : 'Novi artikal'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Image Upload Section */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Slika proizvoda (opciono)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={previewUrl || undefined}
                variant="rounded"
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'grey.200',
                  fontSize: '2rem',
                }}
              >
                {!previewUrl && '🛒'}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                >
                  {previewUrl ? 'Promeni sliku' : 'Dodaj sliku'}
                </Button>
                {previewUrl && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemoveImage}
                    size="small"
                  >
                    Ukloni sliku
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

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
          
          {/* Price Section */}
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

          {/* Sale Price Section */}
          <Box sx={{ p: 2, bgcolor: showSalePrice ? 'error.50' : 'grey.50', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showSalePrice}
                  onChange={(e) => {
                    setShowSalePrice(e.target.checked);
                    if (!e.target.checked) {
                      setForm({ ...form, salePrice: undefined });
                    }
                  }}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOfferIcon color={showSalePrice ? 'error' : 'disabled'} fontSize="small" />
                  <Typography>Artikal na akciji</Typography>
                </Box>
              }
            />
            {showSalePrice && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Akcijska cena (RSD)"
                  value={form.salePrice || ''}
                  onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) || undefined })}
                  color="error"
                  helperText={
                    discountPercent > 0
                      ? `Popust: ${discountPercent}% (ušteda: ${form.price - (form.salePrice || 0)} RSD)`
                      : 'Unesite cenu nižu od regularne cene'
                  }
                />
              </Box>
            )}
          </Box>

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
