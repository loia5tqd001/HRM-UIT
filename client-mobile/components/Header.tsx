import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BACKGROUND_IMG, getWindowSize, SPACING } from '../constants/Layout';
import { primaryColor } from './../constants/Colors';

const Header = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Image source={BACKGROUND_IMG} style={{ width: 30, height: 25 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <FontAwesome name="sign-out" size={24} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: getWindowSize.window.width * 0.9,
    alignSelf: 'center',
    marginVertical: SPACING,
  },
  container: { flexDirection: 'row', alignItems: 'center' },
  button: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,.7)',
    borderRadius: 2,
    marginLeft: 10,
    shadowColor: '#0003',
    shadowOffset: {
      height: 1,
      width: 1,
    },
    shadowOpacity: 30,
  },
});
