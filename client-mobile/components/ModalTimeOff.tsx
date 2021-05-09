import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'
import { TypeTimeOff } from '../screens/TabTwoScreen'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform } from 'react-native'
import { TextInput } from 'react-native'
import { BASE_URL, GET_WIDTH } from '../constants/confgi'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { preventAutoHide } from 'expo-splash-screen'
import moment from 'moment'
import axios from 'axios'
import { useContext } from 'react'
import { AuthContext } from '../Context/AuthContext'
import { getDataAsync } from '../commons'

type TypeModal = {
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  items: TypeTimeOff[]
  setItems: React.Dispatch<React.SetStateAction<TypeTimeOff[]>>
}

const widthDefault = GET_WIDTH - 110

const ModalTimeOff = ({ show, setShow, items, setItems }: TypeModal) => {
  const [open, setOpen] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const [showPickDate, setShowPickDate] = useState({ show: false, type: 1 })
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  //   const [show, setShow] = useState(false);

  const { user } = useContext(AuthContext)

  const [noteValue, setNoteValue] = useState<string>('')

  const setDate = (date: Date) => {
    if (showPickDate.type == 1) {
      var m = moment(date).utcOffset(0)
      m.set({ hour: 6, minute: 59, second: 0 })
      m.toISOString()

      setStartDate(m.toISOString())
    } else {
      var m = moment(date).utcOffset(0)
      m.set({ hour: 7, minute: 0, second: 0 })
      m.toISOString()

      setEndDate(m.toISOString())
    }
    setShowPickDate({ ...showPickDate, show: false })
  }

  const submitData = async () => {
    console.log('data', {
      time_off_type: value,
      start_date: startDate,
      end_date: endDate,
      note: noteValue,
    })

    const dataSubmit = {
      time_off_type: value,
      start_date: startDate,
      end_date: endDate,
      note: noteValue,
    }
    const token = await getDataAsync('token')
    console.log('token', token)

    console.log('ủl', `${BASE_URL}/employees/${user.id}/time_off/ `)

    await axios
      .post(`${BASE_URL}/employees/${user.id}/time_off/ `, dataSubmit, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log('res', res)
      })
      .catch((er) => console.log('er', er))
  }
  return (
    <Modal animationType="slide" transparent={true} visible={show}>
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { minWidth: widthDefault }]}>
          <Text style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
            Select Time off type
          </Text>

          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setValue={setValue}
            setItems={setItems}
            setOpen={setOpen}
          />

          {/* Date Picker */}
          <Text style={{ alignSelf: 'flex-start', marginTop: 20 }}>
            Pick Date
          </Text>
          <View style={styles.timeContain}>
            {/* Start Date */}
            <View style={styles.pickDate}>
              <TouchableOpacity
                style={styles.buttonRed}
                onPress={() => setShowPickDate({ show: true, type: 1 })}
              >
                <Text style={{ color: 'white' }}>Start Date</Text>
              </TouchableOpacity>

              {startDate ? (
                <Text style={{ color: 'black', padding: 10 }}>{startDate}</Text>
              ) : null}
            </View>
            {/* End date */}
            <View style={styles.pickDate}>
              <TouchableOpacity
                style={styles.buttonRed}
                onPress={() => setShowPickDate({ show: true, type: 2 })}
              >
                <Text style={{ color: 'white' }}>End Date</Text>
              </TouchableOpacity>

              {endDate ? (
                <Text style={{ color: 'black', padding: 10 }}>{endDate}</Text>
              ) : null}
            </View>
          </View>

          <DateTimePickerModal
            isVisible={showPickDate.show}
            mode="date"
            onConfirm={(date) => setDate(date)}
            onCancel={() => setShowPickDate({ ...showPickDate, show: false })}
          />

          {/* Date Pick */}

          {/* Note */}
          <Text style={{ alignSelf: 'flex-start' }}>Note:</Text>
          <View style={styles.noteContain}>
            <TextInput
              style={{ height: 60 }}
              numberOfLines={5}
              placeholder="Type here!"
              onChangeText={(text: string) => setNoteValue(text)}
              value={noteValue}
              multiline={true}
            />
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: 'row',
              width: widthDefault,
              justifyContent: 'flex-end',
            }}
          >
            {/* Cancel Button */}
            <View style={styles.buttonSubmit}>
              <TouchableOpacity onPress={() => submitData()}>
                <Text style={{ color: 'white' }}>Submit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonCancel}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={{ color: 'white' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  timeContain: {
    flexDirection: 'row',
    width: widthDefault,
    justifyContent: 'space-between',
    // marginTop: 20,
  },
  pickDate: {
    marginVertical: 10,
    maxWidth: widthDefault / 2,
  },
  buttonRed: {
    backgroundColor: '#C61D1D',
    padding: 10,
    borderRadius: 2,
  },
  buttonCancel: {
    backgroundColor: '#C61D1D',
    alignSelf: 'flex-end',
    marginVertical: 10,
    padding: 10,
    borderRadius: 2,
  },
  buttonSubmit: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    marginVertical: 10,
    padding: 10,
    borderRadius: 2,
    marginRight: 10,
  },
  noteContain: {
    padding: 10,
    width: '100%',
    minWidth: widthDefault,
    borderColor: '#000',
    borderWidth: 0.3,
    marginVertical: 10,
  },
})
