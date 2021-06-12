import { history } from '@/.umi/core/history';
import { useAccess, useModel } from 'umi';

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

type EmployeeDetailAccessProps = {
  isActive: boolean;
  employeeId: number | undefined;
};

export function useEmployeeDetailAccess({ isActive, employeeId }: EmployeeDetailAccessProps) {
  const isCurrentUser = useIsCurrentUser();
  const access = useAccess();

  // LEFT PANEL
  const canChangeAvatar =
    isActive && (isCurrentUser(employeeId) || access['core.can_change_avatar_employee']);
  const canSetRole = isActive && !isCurrentUser(employeeId) && access['core.can_set_role_employee'];
  const canSetPassword =
    isActive && (isCurrentUser(employeeId) || access['core.can_set_password_employee']);
  const canTerminateEmployment =
    isActive && !isCurrentUser(employeeId) && access['job.can_terminate_job'];

  // GENERAL
  const canViewBasicInfo = isCurrentUser(employeeId) || access['core.view_employee'];
  const canChangeBasicInfo =
    isActive && (isCurrentUser(employeeId) || access['core.change_employee']);
  const canViewHomeAddress = isCurrentUser(employeeId) || access['core.view_contactinfo'];
  const canChangeHomeAddress =
    isActive && (isCurrentUser(employeeId) || access['core.change_contactinfo']);
  const canViewEmergencyContact = isCurrentUser(employeeId) || access['core.view_emergencycontact'];
  const canChangeEmergencyContact =
    isActive && (isCurrentUser(employeeId) || access['core.change_emergencycontact']);
  const canViewBankInfo = isCurrentUser(employeeId) || access['core.view_bankinfo'];
  const canChangeBankInfo =
    isActive && (isCurrentUser(employeeId) || access['core.change_bankinfo']);
  const canViewGeneralTab =
    canViewBasicInfo || canViewHomeAddress || canViewEmergencyContact || canViewBankInfo;

  // JOB
  const canViewJob = isCurrentUser(employeeId) || access['job.view_job'];
  const canChangeJob = isActive && (isCurrentUser(employeeId) || access['job.add_job']);
  const canViewSchedule = isCurrentUser(employeeId) || access['attendance.view_employeeschedule'];
  const canChangeSchedule =
    isActive && (isCurrentUser(employeeId) || access['attendance.change_employeeschedule']);
  const canViewJobTab = canViewJob || canViewSchedule;

  // PAYROLL
  const canViewSalaryInfo =
    (isCurrentUser(employeeId) || access['payroll.view_employeesalary']);
  const canChangeSalaryInfo =
    isActive && (isCurrentUser(employeeId) || access['payroll.change_employeesalary']);
  const canViewPayslips = (isCurrentUser(employeeId) || access['payroll.view_payslip']);
  const canViewPayrollTab = canViewSalaryInfo || canViewPayslips;

  // DEPENDENT
  const canViewDependent = (isCurrentUser(employeeId) || access['core.view_dependent']);
  const canAddDependent = isActive && (isCurrentUser(employeeId) || access['core.add_dependent']);
  const canChangeDependent =
    isActive && (isCurrentUser(employeeId) || access['core.change_dependent']);
  const canDeleteDependent =
    isActive && (isCurrentUser(employeeId) || access['core.delete_dependent']);
  const canViewDependentTab = canViewDependent;

  return {
    canChangeAvatar,
    canSetRole,
    canSetPassword,
    canTerminateEmployment,

    canViewGeneralTab,
    canViewBasicInfo,
    canChangeBasicInfo,
    canViewHomeAddress,
    canChangeHomeAddress,
    canViewEmergencyContact,
    canChangeEmergencyContact,
    canViewBankInfo,
    canChangeBankInfo,

    canViewJobTab,
    canViewJob,
    canChangeJob,
    canViewSchedule,
    canChangeSchedule,

    canViewPayrollTab,
    canViewSalaryInfo,
    canChangeSalaryInfo,
    canViewPayslips,

    canViewDependentTab,
    canViewDependent,
    canAddDependent,
    canChangeDependent,
    canDeleteDependent,
  };
}
