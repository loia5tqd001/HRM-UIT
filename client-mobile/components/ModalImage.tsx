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
import Base64 from 'js-base64';
import LzString from 'lz-string';
// import RNFetchBlob from 'react-native-blob-util';
import { getDataAsync } from '../commons';
import RN from 'react-native-image-to-blob';
// function dataURItoBlob(dataURI) {
//   // convert base64 to raw binary data held in a string
//   // console.log('hei', dataURI.split(',')[1]);
//   var byteString = Base64.atob(dataURI.split(',')[1]);

//   // separate out the mime component
//   var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

//   // write the bytes of the string to an ArrayBuffer
//   var arrayBuffer = new ArrayBuffer(byteString.length);
//   var _ia = new Uint8Array(arrayBuffer);
//   for (var i = 0; i < byteString.length; i++) {
//     _ia[i] = byteString.charCodeAt(i);
//   }
//   var dataView = new DataView(arrayBuffer);
//   var blob = new Blob([dataView], { type: mimeString });
//   return blob;
// }

const ModalImage = ({
  modalVisible,
  setModalVisible,
  captureImage,
  nextStep,
  location,
}: {
  modalVisible: boolean;
  setModalVisible: SetStateAction<boolean | any>;
  captureImage: CameraCapturedPicture;
  nextStep: 'clock in' | 'clock out';
  location: { lat: number | undefined; lng: number | undefined };
}) => {
  const { user } = useContext(AuthContext)!;

  const submitData = async () => {
    const key = nextStep === 'clock in' ? 'check_in' : 'check_out';
    // console.log(
    //   '>  ~ file: ModalImage.tsx ~ line 58 ~ key',
    //   captureImage.width,
    //   captureImage.height,
    //   captureImage.uri,
    // );
    // const blob = await fetch('data:image/jpg;base64,' + captureImage.base64).then((it) =>
    //   console.log(it),
    // );
    // console.log(captureImage.base64);
    // console.log('>  ~ file: ModalImage.tsx ~ line 71 ~ captureImage.base64', captureImage.base64)
    // const blob = dataURItoBlob('data:image/jpeg;base64,' + captureImage.base64);
    // console.log('>  ~ file: ModalImage.tsx ~ line 73 ~ blob', blob.size);
    // console.log('>  ~ file: ModalImage.tsx ~ line 60 ~ blob', blob);
    // const dataSubmit = {
    //   [`${key}_lat`]: location?.lat,
    //   [`${key}_lng`]: location?.lng,
    //   [`${key}_note`]: `${nextStep} with face`,
    //   // face_image: await fetch(captureImage.uri).then(it => it.blob()),
    //   face_image: new Blob([captureImage.base64], { type: 'image/jpeg'}),
    // };
    // const blob = await fetch(captureImage.uri).then((it) => it.blob());
    // const dataSubmit = new FormData();
    // dataSubmit.append(`${key}_lat`, String(location?.lat));
    // dataSubmit.append(`${key}_lng`, String(location?.lng));
    // dataSubmit.append(`${key}_note`, `${nextStep} with face`);
    // dataSubmit.append('face_image', blob, 'face.jpeg');

    // RNFetchBlob.fetch(
    //   'POST',
    //   `/employees/${user?.id}/attendance/${nextStep === 'clock in' ? 'check_in' : 'check_out'}/`,
    //   {
    //     Authorization: `Bearer ${await getDataAsync('token')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   [
    //     { name: `${key}_lat`, data: String(location?.lat) },
    //     { name: `${key}_lng`, data: String(location?.lng) },
    //     { name: `${key}_note`, data: `${nextStep} with face` },
    //     // {
    //     //   name: 'face_image',
    //     //   filename: 'face_image.jpg',
    //     //   type: 'image/jpeg',
    //     //   data: RNFetchBlob.wrap(
    //     //     Platform.OS === 'ios' ? captureImage.uri.replace('file://', '') : captureImage.uri,
    //     //   ),
    //     // },

    //     // RNFetchBlob.wrap(
    //     //   Platform.OS === 'ios' ? localImageUri.replace('file://', '') : localImageUri,
    //     // ),
    //   ],
    // )
    //   .then(() => {
    //     Alert.alert(`${nextStep === 'clock in' ? 'Clocked in' : 'Clocked out'} successfully`);
    //     setModalVisible(false);
    //   })
    //   .catch((error) => {
    //     console.log('>  ~ file: ModalImage.tsx ~ line 95 ~ error', error);
    //     if (error.response.data !== 'HANDLED') Alert.alert('Submit request unsuccessfully!');
    //     throw error;
    //   });
    const blob = await fetch(captureImage.uri).then((it) => it.blob());
    const dataSubmit = new FormData();
    dataSubmit.append(`${key}_lat`, String(location?.lat));
    dataSubmit.append(`${key}_lng`, String(location?.lng));
    dataSubmit.append(`${key}_note`, `${nextStep} with face`);
    dataSubmit.append('face_image', blob, 'face.jpeg');
    await axios
      .post(
        `/employees/${user?.id}/attendance/${nextStep === 'clock in' ? 'check_in' : 'check_out'}/`,
        dataSubmit,
      )
      .then(() => {
        Alert.alert(`${nextStep === 'clock in' ? 'Clocked in' : 'Clocked out'} successfully`);
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
