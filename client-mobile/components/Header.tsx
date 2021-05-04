import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { BACKGROUND_IMG, getWindowSize } from '../constants/Layout'

const Header = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: getWindowSize.window.width * 0.9,
        alignSelf: 'center',
      }}
    >
      <Image source={BACKGROUND_IMG} style={{ width: 30, height: 25 }} />
      <FontAwesome name="language" size={24} color="black" />
    </View>
  )
}

export default Header

const styles = StyleSheet.create({})
