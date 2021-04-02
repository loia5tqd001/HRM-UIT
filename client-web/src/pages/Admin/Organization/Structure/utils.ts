export interface ICircularData {
  [key: string]: any;
  children?: ICircularData[];
}

interface IOptions {
  level?: number; // -1 for infinite, 0 for root level only, 1 for 1 level
  key?: string; // rowKey, default is 'id',
}

// Thanks to this answer: https://github.com/ant-design/ant-design/issues/11615#issuecomment-455426294
export function calculateAllExpandedRowKeys(data: ICircularData[] | undefined, options?: IOptions) {
  const rowKeys: string[] = [];
  if (!(data && data.length)) {
    return rowKeys;
  }

  const defaultOptions = {
    level: -1,
    key: 'id',
    ...options,
  };

  const { level, key } = defaultOptions;

  if (!data[0][key]) {
    return rowKeys;
  }

  if (level === 0) {
    return rowKeys;
  }

  function mapRowKeys(source: ICircularData[], currentLevel: number = 1) {
    let keys: string[] = [];
    source.forEach(({ children, ...rest }) => {
      if (children) {
        keys.push(rest[key]);
        if (level < 0 || (level > 0 && level > currentLevel)) {
          const childrenKeys = mapRowKeys(children, currentLevel + 1);
          keys = keys.concat(childrenKeys);
        }
      }
    });
    return keys;
  }

  return mapRowKeys(data);
}
