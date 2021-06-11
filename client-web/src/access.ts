import defaultAccess from './defaultAccess';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function (initialState: { currentUser?: API.Employee | undefined }) {
  const { currentUser } = initialState || {};
  if (!currentUser?.permissions) return {};
  const permissions = currentUser.permissions?.reduce((acc, cur) => ({ ...acc, [cur]: true }), {});
  const access = {
    ...defaultAccess,
    ...permissions,
    '/payroll': !!(
      permissions['payroll.view_salarytemplate'] || permissions['payroll.view_payroll']
    ),
  };
  console.log('>  ~ file: access.ts ~ ', access);
  return access;
}
