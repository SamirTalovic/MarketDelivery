import React, { useRef, useMemo, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ProductCard from './ProductCard';
import type { Product } from '../types';

interface VirtualizedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: number;
}

const MemoizedProductCard = memo(ProductCard);

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  isLoading = false,
  columns = 2,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 👇 KLJUČNO
  const effectiveColumns = isMobile ? 1 : columns;

  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < products.length; i += effectiveColumns) {
      result.push(products.slice(i, i + effectiveColumns));
    }
    return result;
  }, [products, effectiveColumns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isMobile ? 250 : 200),
    overscan: 3,
  });

  if (isLoading) {
    return (
      <Box py={8} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Učitavanje proizvoda...</Typography>
      </Box>
    );
  }

  if (!products.length) {
    return (
      <Box py={8} textAlign="center">
        <Typography>Nema proizvoda</Typography>
      </Box>
    );
  }

  return (
    <Box ref={parentRef} sx={{ height: '70vh', overflow: 'auto' }}>
      <Box
        sx={{
          height: `${rowVirtualizer.getTotalSize()}px`,
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
              transform: `translateY(${virtualRow.start}px)`,
              display: 'grid',
              gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
              gap: 1.5,
              px: 1,
              pb: 1.5,
            }}
          >
            {rows[virtualRow.index].map((product) => (
              <MemoizedProductCard
                key={product.articleId}
                product={product}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default memo(VirtualizedProductGrid);
