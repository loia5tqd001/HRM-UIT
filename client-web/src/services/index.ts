// @ts-ignore
/* eslint-disable */
// API 更新时间：
// API 唯一标识：
import * as auth from './auth';
import * as rule from './__rule';
import * as notices from './__notices';
import { request } from 'umi';
export default {
  auth,
  rule,
  notices,
};

export async function allCountries() {
  return request<API.Country[]>(`/api/countries/`, {
    method: 'GET',
  });
}
