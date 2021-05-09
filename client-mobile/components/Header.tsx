import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { BACKGROUND_IMG, getWindowSize } from '../constants/Layout'

const Header = ({navigation}:{navigation:any}) => {
  return (
    <View style={styles.header}>
      <Image source={BACKGROUND_IMG} style={{ width: 30, height: 25 }} />
      <View style={styles.container}>
        <FontAwesome name="language" size={24} color="black" />
        <TouchableOpacity onPress={()=>navigation.navigate('Login')}>
          <View style={styles.button}>
            <Text>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: getWindowSize.window.width * 0.9,
    alignSelf: 'center',
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
})
