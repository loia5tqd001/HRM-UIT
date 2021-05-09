import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import LottieView from 'lottie-react-native'
import { useEffect } from 'react'

const ModalShow = ({ visible }: { visible: boolean }) => {
  const ref = useRef<LottieView>(null)
  useEffect(() => {
    ref?.current?.play()
  }, [])

  useEffect(
    () => () => {
      ref?.current?.reset()
    },
    [],
  )

  return (
    <Modal
      animationType="slide"
      transparent={false}
      // visible={ false}
      visible={visible}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <LottieView
            // autoPlay
            resizeMode="cover"
            ref={ref}
            style={{
              width: 50,
              height: 50,
              // backgroundColor: '#000',
            }}
            source={require('../assets/loader.json')}
          />
          <Text>Loading ...</Text>
        </View>
      </View>
    </Modal>
  )
}

export default ModalShow

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
    backgroundColor: 'rgba(0,0,0,0.7)',
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // marginTop: 22,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
})
