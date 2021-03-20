import jwt_decode from 'jwt-decode';
import isEmpty from 'lodash/isEmpty';

const STORAGE_TOKEN_NAME = 'TOKEN';

export type JwtPayload = {
  exp: number;
};

/**
 * JWT solution
 * @see https://github.com/ant-design/ant-design-pro/issues/298#issuecomment-354227772
 */
export default {
  check() {
    try {
      const payload = jwt_decode<JwtPayload>(this.get()!);
      return !isEmpty(payload);
    } catch (ex) {
      this.remove();
      return false;
    }
  },
  get() {
    return localStorage.getItem(STORAGE_TOKEN_NAME);
  },
  save(token: string) {
    localStorage.setItem(STORAGE_TOKEN_NAME, token);
  },
  remove() {
    localStorage.removeItem(STORAGE_TOKEN_NAME);
  },
};
