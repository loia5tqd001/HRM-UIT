import { AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import React, { useContext, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { storeAccessToken, storeRefreshToken } from '../commons';
import AlertShow from '../components/AlertShow';
import AsyncButton from '../components/AsyncButton';
import { Text } from '../components/Themed';
<<<<<<< HEAD
import { FontAwesome } from '@expo/vector-icons';
import { BACKGROUND_IMG, SPACING } from '../constants/Layout';
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen

import { AntDesign } from '@expo/vector-icons';

<<<<<<< HEAD
import '../constants/Layout'
import { colorText, colorTextHolder, primaryColor } from '../constants/Colors'
import axios from 'axios'
import { BASE_URL } from '../constants/confgi'
import { AuthContext } from '../Context/AuthContext'
import { storeAccessToken, storeRefreshToken, storeInfoUser } from '../commons'
import { STATE } from '../constants/type'
import AlertShow from '../components/AlertShow'
import ModalShow from '../components/ModalShow'
const { width } = Dimensions.get('window')
=======
import '../constants/Layout';
import { colorText, colorTextHolder } from '../constants/Colors';
import axios from 'axios';
=======
import { colorText, colorTextHolder, primaryColor } from '../constants/Colors';
>>>>>>> 57473b0... Update LoginScreen
import { BASE_URL } from '../constants/confgi';
import '../constants/Layout';
import { BACKGROUND_IMG, SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';

const { width } = Dimensions.get('window');
<<<<<<< HEAD
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
=======
>>>>>>> 57473b0... Update LoginScreen

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [user, onChangeUser] = React.useState<string | undefined>('');
  const [password, onChangePassword] = React.useState<string | undefined>('');

  const [visible, setVisible] = useState<{ show: boolean; text: string }>({
    show: false,
    text: '',
  });
  // cuongnx 123456

<<<<<<< HEAD
  const { setUser } = useContext(AuthContext);
<<<<<<< HEAD
  const checkLogin = () => {
    setState(STATE.LOADING);
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
=======
>>>>>>> 57473b0... Update LoginScreen
=======
  const { setUser } = useContext(AuthContext)!;
>>>>>>> 4fca9bc... Adjust Header, Detail Information

  const checkLogin = async () => {
    await axios
      .post(`${BASE_URL}/auth/token/`, {
        username: user,
        password: password,
      })
      .then((res) => {
        const { access, refresh } = res.data;
        storeAccessToken(access);
        storeRefreshToken(refresh);
        return access;
<<<<<<< HEAD
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
=======
>>>>>>> 57473b0... Update LoginScreen
      })
      .then((token) => {
        axios
          .get(`${BASE_URL}/auth/current_user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            setUser(res.data);
<<<<<<< HEAD
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen

            setState(STATE.LOADED);
          })
<<<<<<< HEAD
          .then(() => setVisible({ show: true, text: 'Success Login' }))
          .then(() =>
            setTimeout(() => {
              navigation.navigate('Root')
=======
          // .then(() => setVisible({ show: true, text: 'Success Login' }))
          .then(() =>
            setTimeout(() => {
              navigation.navigate('Root');
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
            }, 1000),
          )
          .catch((er) => {
            setState(STATE.ERROR);
            console.log('err', er);
=======
            onChangeUser('');
            onChangePassword('');
            navigation.navigate('Root');
>>>>>>> 57473b0... Update LoginScreen
          });
      });
  };
<<<<<<< HEAD
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
=======
>>>>>>> 57473b0... Update LoginScreen

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Alert */}
      {visible.show ? <AlertShow text={visible.text} /> : null}
      {/* Icon Language */}
      <View style={{ flexDirection: 'row-reverse', marginLeft: SPACING * 2 }}>
        <FontAwesome name="language" size={24} color={colorText} style={{ marginTop: SPACING }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={BACKGROUND_IMG} style={styles.img} />
          <Text style={{ fontSize: 33, fontWeight: '700', color: '#000' }}>UIT</Text>
        </View>
        <View style={{ margin: SPACING, opacity: 0.45 }}>
          <Text style={{ color: colorText }}>Human Resource Management Application</Text>
        </View>
        {/* Input */}
        <View style={{ paddingTop: SPACING * 3 }}>
          <View style={styles.inputContainer}>
            <AntDesign name="user" size={19} color={primaryColor} style={styles.icon} />
            <TextInput
              style={styles.textInput}
              maxLength={30}
              placeholder="User"
              placeholderTextColor={colorTextHolder}
              onChangeText={(text) => onChangeUser(text)}
              autoCapitalize="none"
              value={user}
            />
          </View>
        </View>
        <View style={{ paddingVertical: SPACING * 2 }}>
          <View style={styles.inputContainer}>
            <AntDesign name="lock" size={19} color={primaryColor} style={styles.icon} />
            <TextInput
              style={styles.textInput}
              secureTextEntry={true}
              maxLength={30}
              placeholder="Password"
              placeholderTextColor={colorTextHolder}
              onChangeText={(text) => onChangePassword(text)}
              value={password}
            />
          </View>
        </View>
        {/* <View style={styles.button}> */}
        <AsyncButton
          style={styles.button}
          title="Login"
          onSubmit={checkLogin}
          color="white"
          errorMsg="Error Login"
        />
      </KeyboardAvoidingView>

      {/* Bottom */}
      <Text
        style={{ textAlign: 'center', color: colorText, opacity: 0.6, marginBottom: SPACING * 2 }}
      >
        Copyright © 2021 Dung Loi Team
      </Text>
<<<<<<< HEAD
      {/* Modal */}
<<<<<<< HEAD
<<<<<<< HEAD
      <ModalShow visible={state === STATE.LOADING ? true : false} />
=======
      <Modal
        animationType="slide"
        transparent={false}
        visible={false}
        // visible={state === STATE.LOADING ? true : false}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Loading ... </Text>
          </View>
        </View>
      </Modal>
>>>>>>> aebc021... Turnoff username input's autoCapitalize and add KeyboardAvoidingView for Login Screen
=======
      {/* <ModalShow visible={state === STATE.LOADING ? true : false} /> */}
>>>>>>> 57473b0... Update LoginScreen

      {/* Alert */}

      {/* Alert */}
=======
>>>>>>> 4fca9bc... Adjust Header, Detail Information
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 60,
    height: 50,
    marginRight: SPACING * 2,
  },
  button: {
    width: width * 0.9,
    backgroundColor: primaryColor,
    marginTop: SPACING * 3,
    color: 'white',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: width * 0.9,
    padding: 5,
    paddingLeft: SPACING * 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    marginLeft: SPACING,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
  },
});
export default LoginScreen;
