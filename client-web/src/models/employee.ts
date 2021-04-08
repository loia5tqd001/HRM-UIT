import type { ActionType } from '@ant-design/pro-table';
import { message } from 'antd';
import { useCallback, useRef, useState } from 'react';

export type RecordType = API.Employee;

export default function useEmployee() {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [],
  );

  return {
    actionRef,
    onCrudOperation,
    crudModalVisible,
    setCrudModalVisible,
    seletectedRecord,
    setSelectedRecord,
  };
}
