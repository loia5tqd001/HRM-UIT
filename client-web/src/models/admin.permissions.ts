import { useState, useEffect, useCallback, useMemo } from 'react';
import { allRoles, createRole, updateRoleById } from '@/services/auth';
import produce from 'immer';
import isEqual from 'lodash/isEqual';
import { message } from 'antd';

export default function useAdminPermissionsModel() {
  const [rolesPending, setRolesPending] = useState(false);
  const [roles, setRoles] = useState<API.RoleItem[]>([]);
  const [saveChangesPending, setSaveChangesPending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<API.RoleItem>();
  const [draftSelectedRole, setDraftSelectedRole] = useState<API.RoleItem>();
  const [popconfirmVisible, setPopconfirmVisible] = useState(false);
  const [pendingRoleIdToSelect, setPendingRoleIdToSelect] = useState<API.RoleItem['id']>();

  useEffect(() => {
    setRolesPending(true);
    allRoles()
      .then((data) => {
        if (data?.length > 0) {
          setRoles(data);
          setSelectedRole(data[0]);
          setDraftSelectedRole(data[0]);
        }
      })
      .finally(() => {
        setRolesPending(false);
      });
  }, []);

  const selectRoleById = useCallback(
    (id: string) => {
      const newSelectedRole = roles.find((it) => it.id === id);
      setSelectedRole(newSelectedRole);
      setDraftSelectedRole(newSelectedRole);
    },
    [roles],
  );

  const hasModified = useMemo(() => !isEqual(selectedRole, draftSelectedRole), [
    selectedRole,
    draftSelectedRole,
  ]);

  const setAccess = useCallback(
    async (access: API.RoleItem['permissions']['access']) => {
      if (!draftSelectedRole) return;
      const newDraft = produce(draftSelectedRole, (draft) => {
        draft.permissions.access = access;
      });
      setDraftSelectedRole(newDraft);
    },
    [draftSelectedRole],
  );

  const setPermission = useCallback(
    async (permissionId: string, access: API.PermissionItem['access']) => {
      if (!draftSelectedRole) return;
      const newDraft = produce(draftSelectedRole, (draft) => {
        const index = draft.permissions.permission_items.findIndex((it) => it.id === permissionId);
        draft.permissions.permission_items[index].access = access;
      });
      setDraftSelectedRole(newDraft);
    },
    [draftSelectedRole],
  );

  const saveChanges = useCallback(async () => {
    if (!selectedRole || !draftSelectedRole) return;
    try {
      setSaveChangesPending(true);
      await updateRoleById(selectedRole.id, draftSelectedRole);
      setSelectedRole(draftSelectedRole);
      const newRoles = produce(roles, (draft) => {
        const selectedRoleIndex = draft.findIndex((it) => it.id === selectedRole.id);
        draft[selectedRoleIndex] = draftSelectedRole;
      });
      setRoles(newRoles);
      message.success('Save changes successfully!');
    } catch (err) {
      message.error('Cannot save changes!');
      throw err;
    } finally {
      setSaveChangesPending(false);
    }
  }, [draftSelectedRole, roles, selectedRole]);

  const onOkDiscardChanges = useCallback(() => {
    setPopconfirmVisible(false);
    selectRoleById(pendingRoleIdToSelect!);
  }, [pendingRoleIdToSelect, selectRoleById]);

  const onCancelDiscardChanges = useCallback(() => {
    setPopconfirmVisible(false);
  }, []);

  const onAddRole = useCallback(
    async (record: Pick<API.RoleItem, 'roleName' | 'description'>) => {
      try {
        const newRole = await createRole(record);
        setRoles([...roles, newRole]);
        if (!hasModified) {
          setSelectedRole(newRole);
          setDraftSelectedRole(newRole);
        }
        message.success('Create role successfully!');
      } catch (err) {
        message.error('Cannot create role!');
        throw err;
      }
    },
    [hasModified, roles],
  );

  return {
    roles,
    rolesPending,
    hasModified,
    popconfirmVisible,
    selectedRole: draftSelectedRole,
    selectRoleById,
    setAccess,
    setPermission,
    saveChanges,
    saveChangesPending,
    setPopconfirmVisible,
    pendingRoleIdToSelect,
    setPendingRoleIdToSelect,
    onOkDiscardChanges,
    onCancelDiscardChanges,
    onAddRole,
  };
}
