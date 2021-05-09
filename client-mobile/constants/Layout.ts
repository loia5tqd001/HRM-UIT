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

export const BACKGROUND_IMG = require('../assets/images/bg.png');
export const ICON_IMG = require('../assets/images/icon.png');
