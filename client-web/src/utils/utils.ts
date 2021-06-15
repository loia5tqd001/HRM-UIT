import { uniqBy } from 'lodash';
import moment from 'moment';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export const formatDurationHm = (seconds: number) => {
  const duration = moment.duration(Math.abs(seconds), 'seconds');
  return `${Math.sign(seconds) < 0 ? '-' : ''}${Math.floor(duration.asHours())}h${
    duration.minutes() ? `${duration.minutes()}m` : ''
  }`;
};

// Dropdown filter for Table antd: https://stackoverflow.com/a/53894312/9787887
export const filterData =
  <T extends unknown>(data: T[]) =>
  (formatterValue: (x: T) => any, formatterText?: (x: T) => string) =>
    uniqBy(
      data.map((item) => ({
        text: formatterText ? formatterText(item) : formatterValue(item),
        value: formatterValue(item),
      })),
      'value',
    );
