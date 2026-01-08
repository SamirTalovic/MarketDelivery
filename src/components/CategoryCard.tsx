import React from 'react';
import {  Card, CardContent, Typography, Chip } from '@mui/material';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
  productCount: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
  productCount,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        minWidth: { xs: 120, sm: 140 },
        textAlign: 'center',
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: isSelected ? 'primary.main' : 'transparent',
        bgcolor: isSelected ? 'primary.light' : 'background.paper',
        color: isSelected ? 'primary.contrastText' : 'text.primary',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {category.emoji || '📦'}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ 
            mb: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          {category.name}
        </Typography>
        <Chip
          label={`${productCount} artikala`}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'grey.100',
            color: isSelected ? 'inherit' : 'text.secondary',
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
