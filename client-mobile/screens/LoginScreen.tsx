import { AntDesign, FontAwesome } from '@expo/vector-icons';
import React, { useContext } from 'react';
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
import axios from '../commons/axios';
import AsyncButton from '../components/AsyncButton';
import { Text } from '../components/Themed';
import { colorText, colorTextHolder, primaryColor } from '../constants/Colors';
import '../constants/Layout';
import { BACKGROUND_IMG, BORDER_RADIUS, SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [user, onChangeUser] = React.useState<string | undefined>('');
  const [password, onChangePassword] = React.useState<string | undefined>('');

  // cuongnx 123456

  const { setUser } = useContext(AuthContext)!;

  const checkLogin = async () => {
    await axios
      .post(`/auth/token/`, {
        username: user,
        password: password,
      })
      .then((res) => {
        const { access, refresh } = res.data;
        storeAccessToken(access);
        storeRefreshToken(refresh);
        return access;
      })
      .then((token) => {
        axios.get(`/auth/current_user/`).then((res) => {
          setUser(res.data);
          onChangeUser('');
          onChangePassword('');
          navigation.navigate('Home');
        });
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View style={{ paddingTop: SPACING * 3, borderRadius: BORDER_RADIUS }}>
          <View style={styles.inputContainer}>
            <AntDesign name="user" size={19} color={primaryColor} style={styles.icon} />
            <TextInput
              style={styles.textInput}
              maxLength={30}
              placeholder="Username"
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
    borderRadius: BORDER_RADIUS,
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: width * 0.9,
    padding: 5,
    paddingLeft: SPACING * 4,
    borderRadius: BORDER_RADIUS,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS,
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
