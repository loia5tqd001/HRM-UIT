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
import { BORDER_RADIUS, SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';
import { colorText, primaryColor } from './../constants/Colors';
import { AsyncButton } from './AsyncButton';

type TypeModal = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
};

const widthDefault = GET_WIDTH - 110;

export interface TimeOffType {
  id: number;
  name: string;
  description: string;
  is_paid: boolean;
}

const ModalTimeOff = ({ show, setShow, onSuccess }: TypeModal) => {
  const { user } = useContext(AuthContext)!;

  const [showPickDate, setShowPickDate] = useState({ show: false, type: 'start_date' });

  const [timeoffTypes, setTimeoffTypes] = useState<TimeOffType[]>([]);

  const [timeoffType, setTimeoffType] = useState<TimeOffType>();
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);
  const [noteValue, setNoteValue] = useState<string>('');

  React.useEffect(() => {
    axios
      .get(`/time_off_types/`)
      .then((res) => {
        setTimeoffTypes(res.data);
      })
      .catch((er) => {
        console.log('er', er);
      });
  }, []);

  useEffect(() => {
    if (!show) {
      setTimeoffType(undefined);
      setStartDate(null);
      setEndDate(null);
      setNoteValue('');
    }
  }, [show]);

  const submitData = async () => {
    const start_date = moment(startDate);
    const end_date = moment(endDate);
    start_date.set({ hours: 0, minutes: 0, seconds: 0 });
    end_date.set({ hours: 23, minutes: 59, seconds: 0 });
    const dataSubmit = {
      time_off_type: timeoffType,
      start_date,
      end_date,
      note: noteValue,
    };

    await axios
      .post(`/employees/${user?.id}/time_off/`, dataSubmit)
      .then((res) => {
        onSuccess();
        setShow(false);
      })
      .catch((er) => {
        if (er.response.data !== 'HANDLED') Alert.alert('Submit request unsuccessfully!');
      });
  };
  return (
    <Modal animationType="slide" transparent={true} visible={show}>
      <KeyboardAvoidingView
        style={styles.centeredView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalView, { minWidth: widthDefault }]}>
          {/* === Timeoff types */}
          <Text style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
            <Text style={{ color: 'red' }}>* </Text>Timeoff type
          </Text>
          <RNPickerSelect
            onValueChange={(value) => setTimeoffType(value)}
            placeholder={{ key: -1, inputLabel: 'What type of timeoff?' }}
            items={timeoffTypes.map((it) => ({ key: it.id, label: it.name, value: it.name }))}
            textInputProps={{
              // @ts-ignore
              style: {
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderWidth: 0.3,
                borderColor: 'black',
                borderRadius: BORDER_RADIUS,
                color: timeoffType ? colorText : colorTextHolder,
              },
            }}
            Icon={() => {
              return (
                <Ionicons
                  size={30}
                  name="chevron-down-outline"
                  color={'#0003'}
                  style={{
                    flexGrow: 1,
                    height: '100%',
                    marginTop: SPACING / 2,
                    marginRight: 3,
                  }}
                />
              );
            }}
          />

          {/* === Off from */}
          <Text style={{ alignSelf: 'flex-start', marginTop: SPACING * 2 }}>
            <Text style={{ color: 'red' }}>* </Text>Off from
          </Text>
          <TouchableOpacity
            style={styles.noteContain}
            onPress={() => setShowPickDate({ show: true, type: 'start_date' })}
          >
            <TextInput
              style={{ padding: SPACING, borderColor: lightGray, borderRadius: BORDER_RADIUS }}
              placeholder="Pick a day"
              value={startDate ? moment(startDate).format('DD MMM YYYY') : ''}
              multiline={true}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* === Off to */}
          <Text style={{ alignSelf: 'flex-start', marginTop: SPACING }}>
            <Text style={{ color: 'red' }}>* </Text>Off to
          </Text>
          <TouchableOpacity
            style={styles.noteContain}
            onPress={() => setShowPickDate({ show: true, type: 'end_date' })}
          >
            <TextInput
              style={{ padding: SPACING, borderColor: lightGray, borderRadius: BORDER_RADIUS }}
              placeholder="Pick a day"
              value={endDate ? moment(endDate).format('DD MMM YYYY') : ''}
              multiline={true}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* DatePickerModal for Off from and Off to */}
          <DateTimePickerModal
            isVisible={showPickDate.show}
            mode="date"
            onConfirm={(date) => {
              if (showPickDate.type === 'start_date') {
                setStartDate(moment(date));
              }
              if (showPickDate.type === 'end_date') {
                setEndDate(moment(date));
              }
              setShowPickDate({ ...showPickDate, show: false });
            }}
            onCancel={() => setShowPickDate({ ...showPickDate, show: false })}
          />

          {/* === Note */}
          <Text style={{ alignSelf: 'flex-start', marginTop: SPACING, borderRadius: 1 }}>Note</Text>
          <View style={styles.noteContain}>
            <TextInput
              style={{ height: 60, padding: SPACING, borderColor: lightGray }}
              numberOfLines={5}
              placeholder="More about your situation!"
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

export default ModalTimeOff;

const styles = StyleSheet.create({
  modalView: {
    margin: SPACING,
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS,
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
    borderRadius: BORDER_RADIUS,
  },
  buttonSubmit: {
    backgroundColor: primaryColor,
    alignSelf: 'flex-end',
    marginTop: SPACING,
    marginRight: 10,
    borderRadius: BORDER_RADIUS,
  },
  noteContain: {
    width: '100%',
    minWidth: widthDefault,
    borderColor: 'black',
    borderWidth: 0.3,
    marginVertical: 10,
    paddingTop: 5,
    borderRadius: BORDER_RADIUS,
  },
});
