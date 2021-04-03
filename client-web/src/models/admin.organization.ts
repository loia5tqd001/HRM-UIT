import {
  allDepartments,
  allManagers,
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from '@/services/admin.organization.structure';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { produce } from 'immer';

export type CrudModalForm = Pick<
  API.DepartmentUnit,
  'parent_id' | 'name' | 'manager' | 'description'
> & {
  parent: any;
};

export default function useAdminOrganizationStructure() {
  const [departments, setDepartments] = useState<API.DepartmentUnit[]>([]);
  const [departmentsPending, setDepartmentsPending] = useState(false);
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedDepartment, setSelectedDepartment] = useState<API.DepartmentUnit | undefined>();
  const [managers, setManagers] = useState<API.Manager[]>([]);

  // useEffect(() => {
  //   setDepartmentsPending(true);
  //   allDepartments()
  //     .then((data) => {
  //       if (data?.length > 0) {
  //         setDepartments(data);
  //       }
  //     })
  //     .finally(() => {
  //       setDepartmentsPending(false);
  //     });
  // }, []);

  // useEffect(() => {
  //   allManagers().then((data) => setManagers(data));
  // }, []);

  const managerToOptionValue = useCallback(({ id, first_name, last_name }: API.Manager) => {
    return `${id} ${first_name} ${last_name}`;
  }, []);

  const optionManagers = useMemo(() => {
    return managers.map((it) => ({
      value: managerToOptionValue(it),
      label: `${it.first_name} ${it.last_name}`,
    }));
  }, [managers, managerToOptionValue]);

  const onCreateDepartment = useCallback(
    async (record: CrudModalForm) => {
      if (!selectedDepartment) return;
      const createdDepartment = await createDepartment(record as any);
      setDepartments([...departments, createdDepartment]);
    },
    [departments, selectedDepartment],
  );

  const onUpdateDepartment = useCallback(
    async (record: CrudModalForm) => {
      if (!selectedDepartment) return;
      const updatedDepartment = await updateDepartment(selectedDepartment.id, {
        ...selectedDepartment,
        ...record,
      });
      setDepartments(
        produce(departments, (draft) => {
          const foundIndex = departments.findIndex((it) => it.id === selectedDepartment.id);
          if (!foundIndex) return;
          draft[foundIndex] = updatedDepartment;
        }),
      );
    },
    [departments, selectedDepartment],
  );

  const onDeleteDepartment = useCallback(async (id: number) => {
    setDepartmentsPending(true);
    const newDepartments = await deleteDepartment(id);
    setDepartments(newDepartments);
    setDepartmentsPending(false);
  }, []);

  const selectDepartment = useCallback(
    (id: string | number) => {
      setSelectedDepartment(departments.find((it) => String(it.id) === String(id)));
    },
    [departments],
  );

  return {
    departments,
    departmentsPending,
    onCreateDepartment,
    onUpdateDepartment,
    onDeleteDepartment,
    crudModalVisible,
    setCrudModalVisible,
    selectedDepartment,
    setSelectedDepartment,
    selectDepartment,
    optionManagers,
    managerToOptionValue,
  };
}
