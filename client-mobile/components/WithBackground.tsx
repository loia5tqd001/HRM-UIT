import React from 'react';
import { ImageBackground } from 'react-native';
import { BACKGROUND } from '../constants/Layout';

export const WithBackground: React.FC = ({ children }) => {
  return (
    <ImageBackground
      source={BACKGROUND}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
};

export default WithBackground;
