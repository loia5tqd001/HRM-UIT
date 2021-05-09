import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

const AlertShow = ({ text }: { text: string }) => {
  return (
    <View style={[styles.centeredView,StyleSheet.absoluteFillObject]}>
      <View style={styles.modalView}>
        <Text>{text}</Text>
      </View>
    </View>
  )
}

export default AlertShow

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.7)',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // marginTop: 22,
    zIndex: 99,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
})
