import { allDepartments } from '@/services/admin.organization.structure';
import { message } from 'antd';
import { useCallback, useState } from 'react';

export default function useAdminOrganizationStructure() {
  const [departments, setDepartments] = useState<API.DepartmentUnit[]>([]);
  const [departmentsPending, setDepartmentsPending] = useState(false);
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedDepartment, setSelectedDepartment] = useState<API.DepartmentUnit | undefined>();

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        const newData = await allDepartments();
        setDepartments(newData);
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [],
  );

  const selectDepartment = useCallback(
    (id: number) => {
      setSelectedDepartment(departments.find((it) => it.id === id));
    },
    [departments],
  );

  return {
    departments,
    setDepartments,
    departmentsPending,
    setDepartmentsPending,
    onCrudOperation,
    crudModalVisible,
    setCrudModalVisible,
    selectedDepartment,
    setSelectedDepartment,
    selectDepartment,
  };
}
