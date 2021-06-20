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
import { CameraCapturedPicture } from 'expo-camera';
// import RNFetchBlob from 'react-native-blob-util';
import { getDataAsync } from '../commons';

const ModalImage = ({
  modalVisible,
  setModalVisible,
  captureImage,
  nextStep,
  onSuccess,
  location,
}: {
  modalVisible: boolean;
  setModalVisible: SetStateAction<boolean | any>;
  captureImage: CameraCapturedPicture;
  nextStep: 'clock in' | 'clock out';
  onSuccess?: () => any;
  location: { lat: number | undefined; lng: number | undefined };
}) => {
  const { user } = useContext(AuthContext)!;

  const submitData = async () => {
    const key = nextStep === 'clock in' ? 'check_in' : 'check_out';

    // How to upload image from local to server: https://stackoverflow.com/a/42521680/9787887
    let localUri = captureImage.uri;
    let filename = localUri.split('/').pop();

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    const dataSubmit = new FormData();
    dataSubmit.append(`${key}_lat`, String(location?.lat));
    dataSubmit.append(`${key}_lng`, String(location?.lng));
    dataSubmit.append(`${key}_note`, `${nextStep} with face`);
    dataSubmit.append('face_image', { uri: localUri, name: filename, type } as any, 'face.jpeg');

    // This shit doesn't work
    // const blob = await fetch(captureImage.uri).then((it) => it.blob());
    // dataSubmit.append('face_image', blob, 'face.jpeg');

    await axios
      .post(
        `/employees/${user?.id}/attendance/${nextStep === 'clock in' ? 'check_in' : 'check_out'}/`,
        dataSubmit,
      )
      .then(() => {
        Alert.alert(`${nextStep === 'clock in' ? 'Clocked in' : 'Clocked out'} successfully`);
        onSuccess();
        setModalVisible(false);
      })
      .catch((error) => {
        if (error.response.data !== 'HANDLED') Alert.alert('Submit request unsuccessfully!');
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
