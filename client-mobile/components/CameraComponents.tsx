import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import React, { useEffect, useRef, useState } from 'react';
import {
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

interface StateInterface {
  hasPermission: null | boolean;
  type?: any;
}

const Touchable = Platform.select({
  ios: TouchableOpacity,
  android: TouchableWithoutFeedback,
})!;

const CameraComponents = ({ nextStep, setNextStep, location }: any) => {
  const [state, setState] = useState<StateInterface>({
    hasPermission: null,
    type: Camera.Constants.Type.front,
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);

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
            style={{
              width: getWindowSize.window.width * 0.7,
              height: '100%',
              zIndex: 1,
            }}
            onPress={async () => {
              // setShowPopup(true);
              if (ref.current) {
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
                setPreviewVisible(true);
                setCapturedImage(photo);
              }
            }}
          >
            <Camera ref={ref} style={styles.camera} type={state.type} />
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
          onSuccess={() => setNextStep(nextStep === 'clock in' ? 'clock out' : 'clock in')}
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
