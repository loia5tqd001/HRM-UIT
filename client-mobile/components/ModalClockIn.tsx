import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import axios from '../commons/axios';
import { colorTextHolder, lightGray } from '../constants/Colors';
import { GET_WIDTH } from '../constants/config';
import { SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';
import { colorText, primaryColor } from '../constants/Colors';
import { AsyncButton } from './AsyncButton';

type TypeModal = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  outside: boolean;
  nextStep: 'clock in' | 'clock out';
  location: { lat: number | undefined; lng: number | undefined };
  fetchAttendanceStatus: () => any;
};

const widthDefault = GET_WIDTH - 110;

const ModalClockIn = ({
  show,
  setShow,
  outside,
  nextStep,
  location,
  fetchAttendanceStatus,
}: TypeModal) => {
  const { user } = useContext(AuthContext)!;

  const [noteValue, setNoteValue] = useState<string>('');

  useEffect(() => {
    if (!show) {
      setNoteValue('');
    }
  }, [show]);

  const submitData = async () => {
    const key = nextStep === 'clock in' ? 'check_in' : 'check_out';
    const dataSubmit = {
      [`${key}_lat`]: location?.lat,
      [`${key}_lng`]: location?.lng,
      [`${key}_note`]: noteValue,
    };

    await axios
      .post(
        `/employees/${user?.id}/attendance/${nextStep === 'clock in' ? 'check_in' : 'check_out'}/`,
        dataSubmit,
      )
      .then(async (res) => {
        await fetchAttendanceStatus();
        setShow(false);
      })
      .catch((error) => {
        console.log(error.response.data);
        Alert.alert(error.response.data || 'Submit request unsuccessfully!');
      });
  };
  return (
    <Modal animationType="slide" transparent={true} visible={show}>
      <KeyboardAvoidingView
        style={styles.centeredView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalView, { minWidth: widthDefault }]}>
          <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: SPACING * 2 }}>
            {nextStep?.replace(/^c/, 'C')} at {moment().format('HH:mm')}
          </Text>

          {/* === Note */}
          <Text style={{ alignSelf: 'flex-start', marginTop: SPACING, borderRadius: 1 }}>
            {outside && <Text style={{ color: 'red' }}>* </Text>}Note
          </Text>
          <View style={styles.noteContain}>
            <TextInput
              style={{ height: 60, padding: SPACING, borderColor: lightGray }}
              numberOfLines={5}
              placeholder="Leave some note!"
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
            <AsyncButton style={styles.buttonSubmit} title="Submit" onSubmit={submitData} />
            <View style={styles.buttonCancel}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={{ margin: SPACING - 0.7, color: colorText }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalClockIn;

const styles = StyleSheet.create({
  modalView: {
    margin: SPACING,
    backgroundColor: 'white',
    borderRadius: 2,
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
    // backgroundColor: '#C61D1D',
    borderColor: 'black',
    borderWidth: 0.7,
    color: colorText,
    alignSelf: 'flex-end',
    marginTop: 10,
    borderRadius: 1,
  },
  buttonSubmit: {
    backgroundColor: primaryColor,
    alignSelf: 'flex-end',
    marginTop: SPACING,
    borderRadius: 2,
    marginRight: 10,
  },
  noteContain: {
    width: '100%',
    minWidth: widthDefault,
    borderColor: 'black',
    borderWidth: 0.3,
    marginVertical: 10,
    paddingTop: 5,
  },
});
