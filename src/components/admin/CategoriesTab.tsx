import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Category, Product } from '../../types';

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  products,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Kategorije ({categories.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCategory}
        >
          Dodaj kategoriju
        </Button>
      </Box>
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2 
        }}
      >
        {categories.map((category) => (
          <Card key={category.categoryId}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{category.emoji || '📦'}</Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>{category.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {products.filter((p) => p.categoryId === category.categoryId).length} artikala
                </Typography>
              </Box>
              <IconButton onClick={() => onEditCategory(category)}>
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => onDeleteCategory(category.categoryId)}>
                <DeleteIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CategoriesTab;
