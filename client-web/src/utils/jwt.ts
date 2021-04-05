import jwt_decode from 'jwt-decode';
import isEmpty from 'lodash/isEmpty';

const STORAGE_TOKEN_NAME = {
  access: 'ACCESS_TOKEN',
  refresh: 'REFRESH_TOKEN',
};

export type JwtPayload = {
  exp: number;
};

/**
 * JWT solution
 * @see https://github.com/ant-design/ant-design-pro/issues/298#issuecomment-354227772
 */
export default {
  memory: {
    access: '',
    refresh: '',
  },
  check() {
    try {
      const payload = jwt_decode<JwtPayload>(this.getAccess()!);
      return !isEmpty(payload);
    } catch (ex) {
      this.removeAccess();
      this.removeRefresh();
      return false;
    }
  },
  getAccess() {
    return this.memory.access || localStorage.getItem(STORAGE_TOKEN_NAME.access);
  },
  saveAccess(token: string) {
    this.memory.access = token;
    localStorage.setItem(STORAGE_TOKEN_NAME.access, token);
  },
  removeAccess() {
    this.memory.access = '';
    localStorage.removeItem(STORAGE_TOKEN_NAME.access);
  },
  getRefresh() {
    return this.memory.refresh || localStorage.getItem(STORAGE_TOKEN_NAME.refresh);
  },
  saveRefresh(token: string) {
    this.memory.refresh = token;
    localStorage.setItem(STORAGE_TOKEN_NAME.refresh, token);
  },
  removeRefresh() {
    this.memory.refresh = '';
    localStorage.removeItem(STORAGE_TOKEN_NAME.refresh);
  },
};
