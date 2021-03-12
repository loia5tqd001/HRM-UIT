import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  primaryColor: '#2F54EB',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'HRM',
  pwa: true,
  logo: '/logo-uit__white.svg',
  iconfontUrl: '',
  menu: {
    locale: true,
  },
  headerHeight: 48,
  splitMenus: true,
  footerRender: false,
};

export default Settings;
