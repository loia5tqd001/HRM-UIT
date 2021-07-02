import type { TablePaginationConfig } from 'antd';
import { useLayoutEffect, useState } from 'react';

export const useTableSettings = () => {
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem('defaultPageSize')) || 10);
  const [currentPage, setCurrentPage] = useState(1);

  useLayoutEffect(() => {
    localStorage.setItem('defaultPageSize', String(pageSize));
  }, [pageSize]);

  return {
    pagination: {
      pageSize,
      current: currentPage,
      onChange: (page: number, newPageSize: number) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
      },
    } as TablePaginationConfig,
  };
};
