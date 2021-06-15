import type { TablePaginationConfig } from 'antd';

export const useTableSettings = () => {
  const defaultPageSize = Number(localStorage.getItem('defaultPageSize')) || 10;
  const setDefaultPageSize = (pageSize: number) =>
    localStorage.setItem('defaultPageSize', String(pageSize));

  return {
    pagination: {
      defaultPageSize,
      onChange: (_: number, pageSize: number) => setDefaultPageSize(pageSize),
    } as TablePaginationConfig,
  };
};
