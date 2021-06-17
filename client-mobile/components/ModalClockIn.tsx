import moment from 'moment';
import React, { useContext, useState } from 'react';
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
import axios from '../commons/axios';
import { colorText, lightGray, primaryColor } from '../constants/Colors';
import { GET_WIDTH } from '../constants/config';
import { BORDER_RADIUS, SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';
import { AsyncButton } from './AsyncButton';

type TypeModal = {
  show?: boolean; // reactive API
  ref?: React.Ref<any>; // imperative API
  outside: boolean;
  nextStep: 'clock in' | 'clock out';
  location: { lat: number | undefined; lng: number | undefined };
  onSuccess: () => any;
};

type RefModal = React.Ref<{
  resetForm: () => void;
  closeModal: () => void;
  openModal: () => void;
}>;

const widthDefault = GET_WIDTH - 110;

const ModalClockIn = React.forwardRef((props: TypeModal, ref: RefModal) => {
  const [visible, setVisible] = React.useState(false);
  const { show, outside, nextStep, location, onSuccess } = props;

  const { user } = useContext(AuthContext)!;
  const [noteValue, setNoteValue] = useState<string>('');

  React.useEffect(() => {
    if (typeof show === 'boolean') setVisible(show);
  }, [show]);

  const resetForm = React.useCallback(() => {
    setNoteValue('');
  }, []);

  const closeModal = React.useCallback(() => {
    setVisible(false);
    resetForm();
  }, []);

  const openModal = React.useCallback(() => {
    setVisible(true);
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      resetForm,
      closeModal,
      openModal,
    }),
    [],
  );

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
      .then((res) => {
        Alert.alert(`${nextStep === 'clock in' ? 'Clocked in' : 'Clocked out'} successfully`);
        return onSuccess();
      })
      .then(closeModal)
      .catch((error) => {
        if (error.response.data !== 'HANDLED') Alert.alert('Submit request unsuccessfully!');
        throw error;
      });
  };
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
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
            <AsyncButton
              style={styles.buttonSubmit}
              title="Submit"
              onSubmit={submitData}
              destroyOnSubmit={{ success: true, error: false }}
            />
            <View style={styles.buttonCancel}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={{ margin: SPACING - 0.7, color: colorText }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

export default ModalClockIn;

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
    borderRadius: BORDER_RADIUS,
    marginRight: 10,
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
