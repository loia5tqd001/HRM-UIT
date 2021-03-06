import axios from 'axios';
import { clearDataAsync, getDataAsync, storeAccessToken, storeRefreshToken } from '.';
import { BASE_URL } from '../constants/config';
import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Alert } from 'react-native';

type ResponseData = {
  access: string;
  refresh?: string;
};

const onRequest = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  config.headers = {
    Authorization: `Bearer ${await getDataAsync('token')}`,
    'Content-Type': 'application/json',
  };
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  // console.error(`[request error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  // console.info(`[response] [${JSON.stringify(response)}]`);
  return response;
};

let refreshTokenRequest: Promise<AxiosResponse<ResponseData>> | null = null;
const onResponseError = async (error: AxiosError): Promise<AxiosError> => {
  if (!error.response) {
    console.log('Network Error');
    console.log(
      `${'='.repeat(10)}REQUEST${'='.repeat(10)}\n`,
      JSON.stringify(error.config, null, 2),
    );
    console.log(
      `${'='.repeat(10)}RESPONSE${'='.repeat(10)}\n`,
      JSON.stringify(error.response, null, 2),
    );
    return Promise.reject('Network Error');
  }
  console.log(`${'='.repeat(10)}REQUEST${'='.repeat(10)}\n`, JSON.stringify(error.config, null, 2));
  console.log(
    `${'='.repeat(10)}RESPONSE${'='.repeat(10)}\n`,
    JSON.stringify(error.response, null, 2),
  );

  const accessTokenExpired =
    error.response.status === 401 && !error.response.config.url?.includes('/auth/token/refresh');
  if (accessTokenExpired) {
    try {
      if (!refreshTokenRequest) {
        refreshTokenRequest = axios.post<ResponseData>(`${BASE_URL}/auth/token/refresh/`, {
          refresh: await getDataAsync('refresh'),
        });
      }
      // multiple requests but awaiting for only 1 refreshTokenRequest, because of closure
      const res = await refreshTokenRequest;
      if (!res) throw new Error();
      if (res.data.access) storeAccessToken(res.data.access);
      if (res.data.refresh) storeRefreshToken(res.data.refresh);
      error.response.config.headers['Authorization'] = 'Bearer ' + res.data.access;
      return error;
    } catch (err) {
      clearDataAsync();
      throw err;
    } finally {
      refreshTokenRequest = null;
    }
  }
  if (typeof error.response.data === 'string' && error.response.data.length < 50) {
    const convertMessage = {
      'Face recognition failed': 'The system cannot recognize your face. Please try again.',
    };
    if (convertMessage[error.response.data]) {
      Alert.alert(convertMessage[error.response.data]);
    } else {
      Alert.alert(error.response.data);
    }
    error.response.data = 'HANDLED';
  }
  return Promise.reject(error);
};

function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

export default setupInterceptorsTo(axiosInstance);
