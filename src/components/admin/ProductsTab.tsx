import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { Category, Product } from '../../types';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (articleId: number) => void;
}

const ITEMS_PER_PAGE = 50;

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.categoryId === categoryId)?.name || 'Nepoznato';
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (categoryFilter !== 'all' && product.categoryId !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return product.name.toLowerCase().includes(query) || 
               (product.addition?.toLowerCase().includes(query) ?? false);
      }
      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  // Reset page when filters change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: number | 'all') => {
    setCategoryFilter(value);
    setPage(1);
  }, []);

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Artikli ({filteredProducts.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProduct}
        >
          Dodaj artikal
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Pretraga artikala..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Kategorija</InputLabel>
          <Select
            value={categoryFilter}
            label="Kategorija"
            onChange={(e) => handleCategoryChange(e.target.value as number | 'all')}
          >
            <MenuItem value="all">Sve kategorije</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.categoryId} value={cat.categoryId}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Pagination info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Prikazano {paginatedProducts.length} od {filteredProducts.length} artikala
        </Typography>
        {totalPages > 1 && (
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            size="small"
            color="primary"
          />
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell width={60}>Slika</TableCell>
              <TableCell>Naziv</TableCell>
              <TableCell>Kategorija</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Jedinica</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => {
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              return (
                <TableRow key={product.articleId} hover>
                  <TableCell>
                    <Avatar
                      src={product.pictureUrl}
                      variant="rounded"
                      sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}
                    >
                      🛒
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {hasDiscount && (
                        <LocalOfferIcon color="error" fontSize="small" />
                      )}
                      <Box>
                        <Typography fontWeight={600} sx={{ fontSize: '0.875rem' }}>{product.name}</Typography>
                        {product.addition && (
                          <Typography variant="caption" color="text.secondary">
                            {product.addition}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>
                    {hasDiscount ? (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ textDecoration: 'line-through', color: 'text.disabled' }}
                        >
                          {product.price} RSD
                        </Typography>
                        <Typography color="error" fontWeight={600}>
                          {product.salePrice} RSD
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>{product.price} RSD</Typography>
                    )}
                  </TableCell>
                  <TableCell>{product.unit || 'kom'}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.available ? 'Dostupno' : 'Nedostupno'}
                      color={product.available ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onEditProduct(product)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteProduct(product.articleId)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bottom pagination for long lists */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductsTab;
