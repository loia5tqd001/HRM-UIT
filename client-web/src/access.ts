/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function (initialState: { currentUser?: API.Employee | undefined }) {
  const { currentUser } = initialState || {};
  if (!currentUser?.permissions) return {};
  const permissions = currentUser.permissions?.reduce(
    (acc, cur) => ({ ...acc, [cur.codename]: cur.has_perm }),
    {},
  );
  console.log('>  ~ file: access.ts ~ line 11 ~ permissions', permissions);
  const access = {
    // ...defaultAccess,
    ...permissions,
    '/payroll': !!(
      permissions['view_salarytemplate'] ||
      permissions['view_payroll'] ||
      permissions['view_payslip']
    ),
    '/admin/job': !!(
      permissions['view_jobtitle'] ||
      permissions['view_employmentstatus'] ||
      permissions['view_schedule'] ||
      permissions['view_terminationreason']
    ),
    '/admin/organization': !!(permissions['view_department'] || permissions['view_location']),
    '/admin/payroll': !!(permissions['view_taxpolicy'] || permissions['view_insurancepolicy']),
    '/timeOff/configuration': !!(permissions['view_holiday'] || permissions['view_timeofftype']),
  };
  access['/admin'] = !!(
    access['/admin/job'] ||
    access['/admin/organization'] ||
    access['/admin/payroll']
  );
  console.log('>  ~ file: access.ts ~ ', JSON.stringify(access, null, 2));
  return access;
}
