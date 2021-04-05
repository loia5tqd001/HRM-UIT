import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';
import React from 'react';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, history, request as requestUmi } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import Reqs from 'umi-request';
import { currentUser as queryCurrentUser, refreshAccessToken } from './services/auth';
import jwt from './utils/jwt';

// eslint-disable-next-line no-underscore-dangle
const __DEV__ = process.env.NODE_ENV === 'development';

/** When obtaining user information is slow, render a loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.Employee;
  fetchUserInfo?: () => Promise<API.Employee | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrentUser();
      return currentUser;
    } catch (error) {
      history.push('/user/login');
    }
    return undefined;
  };
  // If it is in login page, do not execute
  if (history.location.pathname !== '/user/login') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

// https://umijs.org/zh-CN/plugins/plugin-layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // If you are not logged in, redirect to login
      if (!initialState?.currentUser && location.pathname !== '/user/login') {
        history.push('/user/login');
      }
    },
    title: getIntl?.()?.formatMessage({
      id: 'app.title',
      defaultMessage: 'HRM',
    }),
    links: __DEV__
      ? [
          <>
            <LinkOutlined />
            <span
              onClick={() => {
                window.open('/umi/plugin/openapi');
              }}
            >
              OpenAPI Docs
            </span>
          </>,
          <>
            <BookOutlined />
            <span
              onClick={() => {
                window.open('/~docs');
              }}
            >
              Components Docs
            </span>
          </>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: 'The server successfully returned the requested data.',
  201: 'Create or modify data successfully.',
  202: 'A request has entered the background queue (asynchronous task).',
  204: 'Delete data successfully.',
  400: 'There was an error in the request sent, and the server did not create or modify data.',
  401: 'The user does not have permission (the token, username, password are wrong).',
  403: 'The user is authorized, but access is forbidden.',
  404: 'The request is for a record that does not exist, and the server is not operating.',
  405: 'The requested method is not allowed.',
  406: 'The requested format is not available.',
  410: 'The requested resource has been permanently deleted and will no longer be available.',
  422: 'When creating an object, a validation error occurred.',
  500: 'An error occurred in the server, please check the server.',
  502: 'Gateway error.',
  503: 'The service is unavailable, the server is temporarily overloaded or maintained.',
  504: 'The gateway has timed out.',
};

/** Exception handler
 * @see https://beta-pro.ant.design/docs/request-cn
 */
const errorHandler = (error: ResponseError) => {
  // const { response } = error;

  // if (response && response.status) {
  //   const errorText = codeMessage[response.status] || response.statusText;
  //   message.error(errorText);
  // }

  // if (!response) {
  //   message.error('Cannot connect to the server');
  // }
  console.log('HTTP ERROR', error);

  throw error;
};

const { source } = Reqs.CancelToken;
const { cancel } = source();

let isRefreshing: boolean = false;
let failedQueue: any = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const responseInterceptors = (response: Response, options: RequestOptionsInit) => {
  const { status } = response;
  // const originalRequest: RequestOptionsExtend = options;
  const refreshToken = jwt.getRefresh();

  if (status === 401) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          return requestUmi(
            response.url,
            merge(cloneDeep(options), { headers: { Authorization: `Bearer ${token}` } }),
          );
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    return new Promise<Response>((resolve, reject) => {
      refreshAccessToken(refreshToken!)
        .then((res) => {
          if (res) {
            if (res.access) jwt.saveAccess(res.access);
            if (res.refresh) jwt.saveRefresh(res.refresh);
            processQueue(null, res.access);
            resolve(
              requestUmi(
                response.url,
                merge(cloneDeep(options), { headers: { Authorization: `Bearer ${res.access}` } }),
              ),
            );
          } else {
            throw new Error();
          }
        })
        .catch((err) => {
          failedQueue = [];
          jwt.removeAccess();
          jwt.removeRefresh();
          cancel('Session time out.');
          processQueue(err, null);
          reject(err);
        })
        .then(() => {
          isRefreshing = false;
        });
    });
  }

  return response;
};

// https://umijs.org/zh-CN/plugins/plugin-request
export const request: RequestConfig = {
  errorHandler,
  headers: { Authorization: `Bearer ${jwt.getAccess()}` },
  // Handle refresh token: https://github.com/ant-design/ant-design-pro/issues/7159#issuecomment-680789397
  responseInterceptors: [responseInterceptors],
};
