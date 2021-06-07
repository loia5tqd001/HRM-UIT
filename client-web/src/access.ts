import defaultAccess from './defaultAccess';

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function (initialState: { currentUser?: API.Employee | undefined }) {
  const { currentUser } = initialState || {};
  if (!currentUser) return {};
  const access = currentUser.permissions?.reduce((acc, cur) => ({ ...acc, [cur]: true }), {});
  console.log('>  ~ file: access.ts ~ line 8 ~ access', access);
  return { ...defaultAccess, ...access };
}
