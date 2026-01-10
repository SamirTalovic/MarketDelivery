import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Fuse from 'fuse.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryCard from '../components/CategoryCard';
import VirtualizedProductGrid from '../components/VirtualizedProductGrid';
import FloatingCart from '../components/FloatingCart';
import AddToCartNotification from '../components/AddToCartNotification';
import { useStore } from '../context/StoreContext';
import { usePaginatedProducts } from '../hooks/usePaginatedProducts';
import { useDebounce } from '../hooks/useDebounce';

const Index: React.FC = () => {
  const { categories, products, loadingProducts, cartNotification, clearCartNotification } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Create Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ['name'],
      threshold: 0.4, // Lower = stricter, Higher = more fuzzy (0.4 is good balance)
      distance: 100,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true, // Search anywhere in string
    });
  }, [products]);

  // Filter products based on category and fuzzy search
  const filteredProducts = useMemo(() => {
    let categoryFiltered = selectedCategory === null 
      ? products 
      : products.filter((product) => product.categoryId === selectedCategory);

    if (!debouncedSearch.trim()) {
      return categoryFiltered;
    }

    // Use fuzzy search
    const fuseResults = fuse.search(debouncedSearch);
    
    // Get fuzzy matched products (minimum 50 or all matches)
    const fuzzyMatched = fuseResults
      .slice(0, Math.max(50, fuseResults.length))
      .map(result => result.item);

    // Filter by category if selected
    if (selectedCategory !== null) {
      return fuzzyMatched.filter(p => p.categoryId === selectedCategory);
    }

    return fuzzyMatched;
  }, [products, selectedCategory, debouncedSearch, fuse]);

  // Use paginated products for progressive loading
  const { paginatedProducts, hasMore, loadMore, resetPagination } = usePaginatedProducts(
    filteredProducts,
    { pageSize: 100 }
  );

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [selectedCategory, debouncedSearch, resetPagination]);

  const getProductCountByCategory = (categoryId: number) => {
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 50%, #81C784 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 800,
              mb: 2,
            }}
          >
            Sveže namirnice na vašem pragu
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              mb: 3,
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
            }}
          >
            Brza dostava kvalitetnih proizvoda iz vaše lokalne prodavnice
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="✓ Sveži proizvodi"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label="✓ Brza dostava"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Pretraži proizvode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {/* Categories */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
          Kategorije
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            mb: 4,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 3 },
          }}
        >
          <CategoryCard
            category={{ categoryId: 0, name: 'Sve', emoji: '🏪' }}
            isSelected={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
            productCount={products.length}
          />
          {categories.map((category) => (
            <CategoryCard
              key={category.categoryId}
              category={category}
              isSelected={selectedCategory === category.categoryId}
              onClick={() => setSelectedCategory(category.categoryId)}
              productCount={getProductCountByCategory(category.categoryId)}
            />
          ))}
        </Box>

        {/* Products */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Proizvodi
          </Typography>
          <Typography color="text.secondary">
            {filteredProducts.length} proizvoda
          </Typography>
        </Box>

        <VirtualizedProductGrid 
          products={paginatedProducts} 
          isLoading={loadingProducts}
          columns={4}
        />

        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="outlined" onClick={loadMore}>
              Učitaj više proizvoda
            </Button>
          </Box>
        )}
      </Container>

      <Footer />
      <FloatingCart />
      <AddToCartNotification
        open={!!cartNotification}
        productName={cartNotification?.productName || ''}
        quantity={cartNotification?.quantity || 0}
        onClose={clearCartNotification}
      />
    </Box>
  );
};

export default Index;
