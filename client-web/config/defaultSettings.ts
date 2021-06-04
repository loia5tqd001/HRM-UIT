import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'dark',
  primaryColor: '#1E60E1',
  layout: 'top',
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
  splitMenus: false,
  footerRender: false,
};

export default Settings;
