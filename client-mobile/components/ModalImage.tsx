import moment from 'moment';
import React, { SetStateAction, useContext } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { primaryColor, secondaryColor } from '../constants/Colors';
import { BORDER_RADIUS, getWindowSize, SPACING } from '../constants/Layout';
import AsyncButton from './AsyncButton';
import ModalCustom from './ModalCustom';
import axios from '../commons/axios';
import { AuthContext } from '../Context/AuthContext';

const ModalImage = ({
  modalVisible,
  setModalVisible,
  captureImage,
  nextStep,
  location,
}: {
  modalVisible: boolean;
  setModalVisible: SetStateAction<boolean | any>;
  captureImage: { uri: string; width: number; height: number };
  nextStep: 'clock in' | 'clock out';
  location: { lat: number | undefined; lng: number | undefined };
}) => {
  const { user } = useContext(AuthContext)!;

  const submitData = async () => {
    const key = nextStep === 'clock in' ? 'check_in' : 'check_out';
    const blob = await(await fetch(captureImage.uri)).blob(); 
    const dataSubmit = {
      [`${key}_lat`]: location?.lat,
      [`${key}_lng`]: location?.lng,
      [`${key}_note`]: `${nextStep} with face`,
      face_image: blob,
    };

    await axios
      .post(
        `/employees/${user?.id}/attendance/${nextStep === 'clock in' ? 'check_in' : 'check_out'}/`,
        dataSubmit,
      )
      .then((res) => {
        return fetchAttendanceStatus();
      })
      .then(() => {
        Alert.alert(`${nextStep === 'clock in' ? 'Clocked in' : 'Clocked out'} successfully`);
      })
      .then(() => {
        setModalVisible(false);
      })
      .catch((error) => {
        console.log(error.response.data);
        Alert.alert(error.response.data || 'Submit request unsuccessfully!');
        throw error;
      });
  };

  if (!captureImage) {
    return null;
  } else {
    return (
      <ModalCustom modalVisible={modalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: SPACING * 2 }}>
              {nextStep?.replace(/^c/, 'C')} at {moment().format('HH:mm')}
            </Text>
            <Image source={{ uri: captureImage && captureImage.uri }} style={styles.image} />
            {/*  */}
            <View style={styles.container}>
              {/* <TouchableHighlight
                style={{
                  ...styles.openButton,
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                onPress={() => {
                  console.log('photo', captureImage);
                }}
              >
                <Text style={styles.textStyle}>Send</Text>
              </TouchableHighlight> */}
              <AsyncButton
                style={{
                  ...styles.openButton,
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                title="Submit"
                onSubmit={submitData}
                destroyOnSubmit={{ success: true, error: false }}
              />
              <TouchableHighlight
                style={{
                  ...styles.openButton,
                  borderColor: primaryColor,
                }}
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text style={{ ...styles.textStyle, color: primaryColor, marginHorizontal: 0 }}>
                  Cancel
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ModalCustom>
    );
  }
};

export default ModalImage;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    width: getWindowSize.window.width * 0.9,
    height: getWindowSize.window.height * 0.8,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  image: {
    width: getWindowSize.window.width * 0.7,
    height: getWindowSize.window.height * 0.5,
    maxWidth: getWindowSize.window.width * 0.7 * 1.5,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS * 4,
    marginBottom: SPACING * 2,
  },
  container: {
    width: getWindowSize.window.width * 0.7,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  openButton: {
    borderRadius: BORDER_RADIUS,
    padding: 5,
    paddingHorizontal: 15,
    elevation: 2,
    borderWidth: 1,
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
    margin: 10,
  },
});
function fetchAttendanceStatus(): any {
  throw new Error('Function not implemented.');
}
