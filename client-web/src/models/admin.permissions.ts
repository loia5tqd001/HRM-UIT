import { useState, useEffect, useCallback, useMemo } from 'react';
import { allRoles, updateRoleById } from '@/services/auth';
import produce from 'immer';
// import { RoleItem } from './admin.permissions';

// export interface ModelState {
//   roles: RoleItem[];
//   selectedRole: RoleItem | undefined;
//   // currentUser?: Partial<CurrentUser>;
//   // province?: GeographicItemType[];
//   // city?: GeographicItemType[];
//   isLoading?: boolean;
// }

export default function useAdminPermissionsModel() {
  const [roles, setRoles] = useState<API.RoleItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<API.RoleItem>();
  const [isLoading, setIsLoading] = useState(false);
  const [popconfirmVisible, setPopconfirmVisible] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    allRoles()
      .then((data) => {
        if (data?.length > 0) {
          setRoles(data);
          setSelectedRole(data[0]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setSelectedRoleById = useCallback(
    (id: string) => {
      setPopconfirmVisible(false);
      setSelectedRole(roles.find((it) => it.id === id));
    },
    [roles],
  );

  const setAccessForSelectedRole = useCallback(
    async (access: API.RoleItem['permissions']['access']) => {
      if (!selectedRole) return;
      const newRole = produce(selectedRole, (draft) => {
        draft.permissions.access = access;
      });
      await updateRoleById(selectedRole.id, newRole);
      const newRoles = produce(roles, (draft) => {
        const selectedRoleIndex = draft.findIndex((it) => it.id === selectedRole.id);
        draft[selectedRoleIndex] = newRole;
      });
      setSelectedRole(newRole);
      setRoles(newRoles);
    },
    [roles, selectedRole],
  );

  return {
    roles,
    selectedRole,
    setSelectedRoleById,
    setAccessForSelectedRole,
    popconfirmVisible,
    setPopconfirmVisible,
    isLoading,
  };
}
