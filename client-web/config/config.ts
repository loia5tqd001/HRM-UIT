// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import mapKeys from 'lodash/mapKeys'

const {
  PORT,
  REACT_APP_ENV,
  ...envVariables
} = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'secondary-color': '#0387B1',
    'border-radius-base': '5px',
    // 'box-shadow-base':
    //   '0 3px 12px -8px rgba(0, 0, 0, 0.12), 0 6px 32px 0 rgba(0, 0, 0, 0.8), 0 9px 56px 16px rgba(0, 0, 0, 0.06)',
    // 'card-shadow':
    //   '0 2px 8px -2px rgba(0, 0, 0, 0.24), 0 6px 24px 0 rgba(0, 0, 0, 0.18), 0 10px 48px 4px rgba(0, 0, 0, 0.15)',
    'screen-xl': '1440px',
    'layout-header-background': '#13334c',
    'menu-dark-inline-submenu-bg': '#13334c',
    'layout-body-background': '#fff',
    'text-color-secondary-dark': 'rgba(255, 255, 255, 0.75)',
    'processing-color': '#0387B1',
    'tag-line-height': '25px',
    'tag-font-size': '14px',
    'text-color': '#2a333c',
    'font-size-base': '15px',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: 'HRM',
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  openAPI: {
    requestLibPath: "import { request } from 'umi'",
    // 或者使用在线的版本
    // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
    schemaPath: join(__dirname, 'oneapi.json'),
    mock: false,
  },
  define: {
    ...mapKeys(envVariables, (_, key) => `process.env.${key}`),
    PORT: PORT || 3000, // This should work (https://v2.umijs.org/guide/env-variables.html#port), but it doesn't, so I create a .env file
    // https://github.com/ant-design/ant-design-pro/issues/5862
  },
});
