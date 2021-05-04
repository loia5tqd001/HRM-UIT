import React, { SetStateAction } from 'react'
import { Alert, Modal, StyleSheet, Text, View, Image } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { primaryColor, secondaryColor } from '../constants/Colors'
import { getWindowSize, SPACING } from '../constants/Layout'
import ModalCustom from './ModalCustom'

const ModalImage = ({
  modalVisible,
  setModalVisible,
  captureImage,
}: {
  modalVisible: boolean
  setModalVisible: SetStateAction<boolean | any>
  captureImage: { uri: string; width: number; height: number }
}) => {
  if (!captureImage) {
    return null
  } else {
    return (
      <ModalCustom modalVisible={modalVisible}>
        <Image
          source={{ uri: captureImage && captureImage.uri }}
          style={styles.image}
        />
        {/*  */}
        <View style={styles.container}>
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: primaryColor }}
            onPress={() => {
              console.log('photo', captureImage)
            }}
          >
            <Text style={styles.textStyle}>Send</Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: secondaryColor }}
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableHighlight>
        </View>
      </ModalCustom>
    )
  }
}

export default ModalImage

const styles = StyleSheet.create({
  image: {
    width: getWindowSize.window.width * 0.7,
    height: getWindowSize.window.width * 0.7,
    maxWidth: getWindowSize.window.width * 0.7 * 1.5,
    alignItems: 'center',
    borderRadius: (getWindowSize.window.width * 0.7) / 2,
    marginBottom: SPACING * 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: getWindowSize.window.width,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
