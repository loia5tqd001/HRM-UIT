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
    can_cancel_timeoff: permissions['can_approve_timeoff'],
    '/payroll': !!(permissions['view_salarytemplate'] || permissions['view_payroll']),
  };
  console.log('>  ~ file: access.ts ~ ', JSON.stringify(access, null, 2));
  return access;
}
