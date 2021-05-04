import React, { SetStateAction } from 'react'
import {  StyleSheet, Text, View } from 'react-native'
import { TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import { primaryColor, secondaryColor, thirdColor } from '../constants/Colors'
import { getWindowSize, SPACING } from '../constants/Layout'
import ModalCustom from './ModalCustom'

const ModalClock = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean
  setModalVisible: SetStateAction<boolean | any>
}) => {
  const [value, setValue] = React.useState<string>('')

  //   Function
  const onSubmitData = () => {
    console.log('vl', value)
  }
  //
  return (
    <ModalCustom modalVisible={modalVisible}>
      <View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(name) => setValue(name)}
          autoFocus={true}
          autoCapitalize="words"
          autoCorrect={true}
          keyboardType="default"
          returnKeyType="next"
          blurOnSubmit={false}
          numberOfLines={5}
          multiline={true}
        />
        {/*  */}
        <View style={styles.container}>
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: primaryColor }}
            onPress={() => onSubmitData()}
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
          <TouchableHighlight
            style={{ ...styles.openButton, backgroundColor: thirdColor }}
            onPress={() => {
              setValue('')
            }}
          >
            <Text style={styles.textStyle}>Clear</Text>
          </TouchableHighlight>
        </View>
      </View>
    </ModalCustom>
  )
}

export default ModalClock

const styles = StyleSheet.create({
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
  input: {
    margin: 20,
    marginBottom: SPACING * 4,
    height: SPACING * 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    color: 'white',
    width: getWindowSize.window.width * 0.9,
    maxWidth: getWindowSize.window.width * 0.9,
  },
})
