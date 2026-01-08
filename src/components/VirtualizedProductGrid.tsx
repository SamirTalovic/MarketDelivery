import React, { useRef, useMemo, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, CircularProgress, Typography } from '@mui/material';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface VirtualizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: number;
}

// Memoized ProductCard wrapper to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  isLoading = false,
  columns = 4,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate rows based on products and columns
  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < products.length; i += columns) {
      result.push(products.slice(i, i + columns));
    }
    return result;
  }, [products, columns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Estimated row height
    overscan: 5, // Render 5 extra rows above/below viewport
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 8,
        }}
      >
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }} color="text.secondary">
          Učitavanje proizvoda...
        </Typography>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary',
        }}
      >
        <Typography variant="h6">Nema proizvoda</Typography>
        <Typography variant="body2">Pokušajte sa drugom pretragom</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={parentRef}
      sx={{
        height: 'calc(100vh - 400px)',
        minHeight: 400,
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 4 },
      }}
    >
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <Box
            key={virtualRow.key}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: `repeat(${columns}, 1fr)`,
              },
              gap: 3,
              px: 0.5,
              pb: 3,
            }}
          >
            {rows[virtualRow.index]?.map((product) => (
              <MemoizedProductCard key={product.articleId} product={product} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default memo(VirtualizedProductGrid);
