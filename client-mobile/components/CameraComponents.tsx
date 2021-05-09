import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getWindowSize, SPACING } from '../constants/Layout';
import ModalImage from './ModalImage';

interface StateInterface {
  hasPermission: null | boolean;
  type?: any;
}

const CameraComponents = (props: any) => {
  const [state, setState] = useState<StateInterface>({
    hasPermission: null,
    type: Camera.Constants.Type.back,
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
  // Take photo
  const takePicture = async () => {
    if (ref.current) {
      let photo = await ref.current?.takePictureAsync();

      setPreviewVisible(true);
      setCapturedImage(photo);
      // setModalVisible(true);
      // props.capturedImageProps(photo);
    }
  };
  // Function

  const { hasPermission } = state;
  if (hasPermission === null) {
    return <View />;
  } else if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  } else {
    return (
      <View style={{ marginVertical: SPACING }}>
        <View style={styles.container}>
          <Camera ref={ref} style={styles.camera} type={state.type}></Camera>
          <View style={styles.buttons}>
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
          </View>
        </View>

        {/* Modal */}
        <ModalImage
          modalVisible={previewVisible}
          setModalVisible={(c: boolean) => setPreviewVisible(c)}
          captureImage={capturedImage}
        />
      </View>
    );
  }
};

export default CameraComponents;

const styles = StyleSheet.create({
  container: {
    height: getWindowSize.window.height * 0.5,
    backgroundColor: '#4343',
  },
  camera: { flex: 1, width: getWindowSize.window.width * 0.7 },
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
