import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';
import type { Category } from '../../types';

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: { name: string; emoji: string }) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  category,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({ name: '', emoji: '' });

  useEffect(() => {
    if (category) {
      setForm({ name: category.name, emoji: category.emoji || '' });
    } else {
      setForm({ name: '', emoji: '' });
    }
  }, [category, open]);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Izmeni kategoriju' : 'Nova kategorija'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Naziv kategorije"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Ikonica (emoji)"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            placeholder="npr. 🍎"
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

export default CategoryDialog;
