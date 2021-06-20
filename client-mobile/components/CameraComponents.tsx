import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BORDER_RADIUS, getWindowSize } from '../constants/Layout';
import { primaryColor } from './../constants/Colors';
import ModalImage from './ModalImage';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from '../commons/axios';

interface StateInterface {
  hasPermission: null | boolean;
  type?: any;
}

const Touchable = Platform.select({
  ios: TouchableOpacity,
  android: TouchableWithoutFeedback,
})!;

const CameraComponents = ({ nextStep, location, onSuccess }: any) => {
  const [state, setState] = useState<StateInterface>({
    hasPermission: null,
    type: Camera.Constants.Type.front,
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [detecting, setDetecting] = useState(false);

  const ref = useRef<Camera | null>(null);
  // init func
  useEffect(() => {
    initPermission();
  }, []);

  const initPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    setState({ ...state, hasPermission: status === 'granted' });
  };

  // Function

  // Change Type Camera
  const handleCameraType = () => {
    setState({
      ...state,
      type:
        state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    });
  };

  // Function

  const { hasPermission } = state;
  if (hasPermission === null) {
    return <View />;
  } else if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={{ alignSelf: 'center' }}>
        <View style={styles.container}>
          <Touchable
            disabled={detecting}
            style={{
              width: getWindowSize.window.width * 0.7,
              height: '100%',
              zIndex: 1,
              position: 'relative',
            }}
            onPress={async () => {
              // setShowPopup(true);
              if (ref.current) {
                try {
                  setDetecting(true);
                  let photo = await ref.current?.takePictureAsync().then((takenPhoto) => {
                    // lessen the image's size
                    return ImageManipulator.manipulateAsync(
                      takenPhoto.uri,
                      [{ resize: { width: 350 } }, { flip: ImageManipulator.FlipType.Horizontal }],
                      {
                        base64: true,
                        compress: 0.5,
                        format: ImageManipulator.SaveFormat.JPEG,
                      },
                    );
                  });
                  if (photo) {
                    let localUri = photo.uri;
                    let filename = localUri.split('/').pop();

                    // Infer the type of the image
                    let match = /\.(\w+)$/.exec(filename);
                    let type = match ? `image/${match[1]}` : `image`;
                    const dataSubmit = new FormData();
                    dataSubmit.append(
                      'image',
                      { uri: localUri, name: filename, type } as any,
                      'face.jpeg',
                    );
                    axios
                      .post<any[]>(`/auth/detect_faces/`, dataSubmit)
                      .then((data) => {
                        if (data.data.length === 0) {
                          Alert.alert('Cannot find any faces in the camera. Please try again!');
                        } else if (data.data.length > 1) {
                          Alert.alert('There are too many faces in the camera. Please try again!');
                        }
                        if (data.data.length === 1) {
                          setPreviewVisible(true);
                          setCapturedImage(photo);
                        }
                      })
                      .catch((error) => {
                        if (error.response.data !== 'HANDLED')
                          // Alert.alert('Submit request unsuccessfully!');
                          throw error;
                      });
                  }
                } finally {
                  setDetecting(false);
                }
              }
            }}
          >
            <Camera ref={ref} style={styles.camera} type={state.type} />
            {detecting && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'white',
                }}
              >
                <ActivityIndicator
                  size="large"
                  style={{
                    width: 50,
                    height: 50,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: [{ translateX: -25 }, { translateY: -25 }],
                  }}
                />
              </View>
            )}
          </Touchable>
          {/* <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.button}
              // onPress={() => takePicture()}
            >
              <FontAwesome name="camera" style={{ color: 'transparent', fontSize: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => takePicture()}>
              <FontAwesome name="camera" style={{ color: '#fff', fontSize: 40 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleCameraType()}>
              <MaterialCommunityIcons
                name="camera-switch"
                style={{ color: '#fff', fontSize: 40 }}
              />
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Modal */}
        <ModalImage
          modalVisible={previewVisible}
          setModalVisible={(c: boolean) => setPreviewVisible(c)}
          captureImage={capturedImage}
          nextStep={nextStep}
          onSuccess={onSuccess}
          location={location}
        />
      </View>
    );
  }
};

export default CameraComponents;

const styles = StyleSheet.create({
  container: {
    height: getWindowSize.window.height * 0.5,
    borderRadius: BORDER_RADIUS * 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: primaryColor,
  },
  camera: {
    flex: 1,
    width: getWindowSize.window.width * 0.7,
  },
  buttons: {
    // flex: 1,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
