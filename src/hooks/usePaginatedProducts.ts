import { useState, useMemo, useCallback } from 'react';
import type { Product } from '../types';

interface UsePaginatedProductsOptions {
  pageSize?: number;
}

interface UsePaginatedProductsResult {
  paginatedProducts: Product[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loadMore: () => void;
  resetPagination: () => void;
}

export const usePaginatedProducts = (
  products: Product[],
  options: UsePaginatedProductsOptions = {}
): UsePaginatedProductsResult => {
  const { pageSize = 50 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(products.length / pageSize),
    [products.length, pageSize]
  );

  const paginatedProducts = useMemo(
    () => products.slice(0, currentPage * pageSize),
    [products, currentPage, pageSize]
  );

  const hasMore = currentPage < totalPages;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    paginatedProducts,
    currentPage,
    totalPages,
    hasMore,
    loadMore,
    resetPagination,
  };
};
