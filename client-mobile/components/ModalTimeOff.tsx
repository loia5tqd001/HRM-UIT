import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { TypeTimeOff } from '../screens/TabTwoScreen'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from 'react-native'
import { TextInput } from 'react-native'
import { GET_WIDTH } from '../constants/confgi'

type TypeModal = {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  items: TypeTimeOff[]
  setItems: React.Dispatch<React.SetStateAction<TypeTimeOff[]>>
}
const ModalTimeOff = ({ show, setShow, items, setItems }: TypeModal) => {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const [date, setDate] = useState(new Date(1598051730000))
  //   const [show, setShow] = useState(false);

  const [noteValue, setNoteValue] = useState<string>('')
  return (
    <Modal animationType="slide" transparent={true} visible={show}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { minWidth: GET_WIDTH - 110 }]}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setValue={setValue}
            setItems={setItems}
            setOpen={setOpen}
          />

          <View
            style={{
              padding: 10,
              width: '100%',
              minWidth: GET_WIDTH - 110,
              borderColor: '#000',
              borderWidth: 0.3,
              marginVertical: 10,
            }}
          >
            <TextInput
              style={{ height: 40 }}
              numberOfLines={3}
              placeholder="Type here to translate!"
              onChangeText={(text: string) => setNoteValue(text)}
              value={noteValue}
            />
           
          </View>
          {/* <Text>{noteValue}</Text> */}
          <View
            style={{
              backgroundColor: '#C61D1D',
              alignSelf: 'flex-end',
              marginVertical: 10,
              padding: 10,
              borderRadius: 5,
            }}
          >
            <TouchableOpacity onPress={() => setShow(false)}>
              <Text style={{ color: 'white' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ModalTimeOff

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
    // marginBottom: 15,
    textAlign: 'center',
    // fontSize: 22,
    fontWeight: '600',
  },
})
