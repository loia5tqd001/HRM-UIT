import React from 'react'
import {
  Button,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TextInput,
  TextInputBase,
  Dimensions,
} from 'react-native'
import { Text } from '../components/Themed'
import { FontAwesome } from '@expo/vector-icons'
import { BACKGROUND_IMG, SPACING } from '../constants/Layout'

import { AntDesign } from '@expo/vector-icons'

import '../constants/Layout'
import { colorText,colorTextHolder } from '../constants/Colors'
const { width } = Dimensions.get('window')

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [user, onChangeUser] = React.useState<string | undefined>('')
  const [password, onChangePassword] = React.useState<string | undefined>('')
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Icon Language */}
      <View style={{ flexDirection: 'row-reverse', marginLeft: SPACING *2}}>
        <FontAwesome name="language" size={24} color={colorText} />
      </View>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={BACKGROUND_IMG} style={styles.img} />
          <Text style={{ fontSize: 33, fontWeight: '700',color:'#000' }}>UIT</Text>
        </View>
        <View style={{ margin: SPACING, opacity: 0.4 }}>
          <Text style={{color:colorText}}>Human Resource Management Application</Text>
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
            onPress={() => navigation.navigate('Root')}
          />
        </View>
      </View>

      {/* Bottom */}
      <Text style={{ textAlign: 'center',color:colorText,opacity:.6 }}>
        Copyright © 2021 Dung Loi Team
      </Text>
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
})
export default LoginScreen
