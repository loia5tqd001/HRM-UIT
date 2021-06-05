import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export const getWindowSize = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
};

export const SPACING = 12;
export const BORDER_RADIUS = 5;
export const BOX_SHADOW =
  'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px';

export const BACKGROUND_IMG = require('../assets/images/bg.png');
export const ICON_IMG = require('../assets/images/icon.png');
