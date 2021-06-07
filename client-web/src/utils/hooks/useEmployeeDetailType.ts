import { history } from '@/.umi/core/history';
import { useModel } from 'umi';

export type EmployeeDetailType = 'employee-edit' | 'account-profile' | undefined;

export function useEmployeeDetailType(): EmployeeDetailType {
  const { pathname } = history.location;

  if (pathname.includes('profile')) {
    return 'account-profile';
  }

  if (pathname.includes('employee')) {
    return 'employee-edit';
  }

  return undefined;
}

export function useIsCurrentUser() {
  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.currentUser!;
  return (compareId: number | undefined) => compareId === id;
}
