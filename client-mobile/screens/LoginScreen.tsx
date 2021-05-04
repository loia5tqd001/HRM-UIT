import React, { useContext, useState } from 'react'
import {
  Button,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native'
import { Text } from '../components/Themed'
import { FontAwesome } from '@expo/vector-icons'
import { BACKGROUND_IMG, SPACING } from '../constants/Layout'

import { AntDesign } from '@expo/vector-icons'

import '../constants/Layout'
import { colorText, colorTextHolder } from '../constants/Colors'
import axios from 'axios'
import { BASE_URL } from '../constants/confgi'
import { AuthContext } from '../Context/AuthContext'
import { storeAccessToken, storeRefreshToken, storeInfoUser } from '../commons'
import { STATE } from '../constants/type'
const { width } = Dimensions.get('window')


const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [user, onChangeUser] = React.useState<string | undefined>('')
  const [password, onChangePassword] = React.useState<string | undefined>('')

  const [state, setState] = useState<STATE>(STATE.IDLE)

  const { setUser } = useContext(AuthContext)
  const checkLogin = () => {
    setState(STATE.LOADING)

    axios
      .post(`${BASE_URL}/auth/token/`, {
        username: user,
        password: password,
      })
      .then((res) => {
        const { access, refresh } = res.data

        storeAccessToken(access)
        storeRefreshToken(refresh)

        return access
      })
      .then((token) => {
        axios
          .get(`${BASE_URL}/auth/current_user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            console.log('res', res.data)
            // storeInfoUser(res.data);
            setUser(res.data)

            setState(STATE.LOADED)
          })
          .then(() => navigation.navigate('Root'))
          .catch((er) => {
            setState(STATE.ERROR)
            console.log('err', er)
          })
      })
      .catch((er) => {
        console.log('er', er)
        setState(STATE.ERROR)
      })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Icon Language */}
      <View style={{ flexDirection: 'row-reverse', marginLeft: SPACING * 2 }}>
        <FontAwesome name="language" size={24} color={colorText} />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={BACKGROUND_IMG} style={styles.img} />
          <Text style={{ fontSize: 33, fontWeight: '700', color: '#000' }}>
            UIT
          </Text>
        </View>
        <View style={{ margin: SPACING, opacity: 0.4 }}>
          <Text style={{ color: colorText }}>
            Human Resource Management Application
          </Text>
        </View>

        {/* Input */}
        <View style={{ paddingTop: SPACING * 3 }}>
          <View style={styles.inputContainer}>
            <AntDesign name="user" size={19} color="blue" style={styles.icon} />
            <TextInput
              style={styles.textInput}
              maxLength={30}
              placeholder="User"
              placeholderTextColor={colorTextHolder}
              onChangeText={(text) => onChangeUser(text)}
              value={user}
            />
          </View>
        </View>

        <View style={{ paddingVertical: SPACING * 2 }}>
          <View style={styles.inputContainer}>
            <AntDesign name="lock" size={19} color="blue" style={styles.icon} />

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

        <View style={styles.button}>
          <Button
            title="Login"
            color="white"
            // onPress={() => navigation.navigate('Root')}
            onPress={() => checkLogin()}
          />
        </View>
      </View>

      {/* Bottom */}
      <Text style={{ textAlign: 'center', color: colorText, opacity: 0.6 }}>
        Copyright © 2021 Dung Loi Team
      </Text>
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={state === STATE.LOADING ? true : false}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Loading ... </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

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
    backgroundColor: 'blue',
    marginTop: SPACING * 3,
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
})
export default LoginScreen
