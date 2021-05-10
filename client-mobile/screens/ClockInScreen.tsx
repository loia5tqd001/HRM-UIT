import axios from 'axios';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Header from '../components/Header';
import ModalTimeOff from '../components/ModalTimeOff';
import { ListHistory } from '../components/TimeoffHistory';
import { BASE_URL, GET_WIDTH } from '../constants/confgi';
import { primaryColor } from '../constants/Colors';
import AsyncButton from '../components/AsyncButton';
import { SPACING } from '../constants/Layout';

export default function ClockInScreen({ navigation }: any) {
  const [show, setShow] = React.useState<boolean>(false);

  const [value, setValue] = useState("")
  const submitData= async()=>{

  }
  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <View style={{flex:1,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
        <View style={{padding:20}}>
          <Text style={{fontSize:30}}>Clock In</Text>
        </View>
        <View style={{marginBottom:GET_WIDTH*.2}}>
          <Text style={{fontSize:15}}>Clock in at XXX</Text>
        </View>
      
        <TextInput
          style={styles.input}
          value={value}
          placeholder="Leave a note"
          onChangeText={(name) => setValue(name)}
          // autoFocus={true}
          autoCapitalize="words"
          autoCorrect={true}
          keyboardType="default"
          returnKeyType="next"
          blurOnSubmit={false}
          numberOfLines={5}
          multiline={true}
        />
        {/*  */}
        <View style={styles.container}>

          <AsyncButton
          style={{...styles.button, backgroundColor: primaryColor }}
          title="Submit"
          onSubmit={submitData}
          color="white"
          errorMsg="Error Login"
        />
        </View>
      </View>
      <View>

    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '80%',
  },
  button: {
    width: GET_WIDTH * 0.9,
    backgroundColor: primaryColor,
    marginTop: SPACING * 3,
    color: 'white',
  },
  input: {
    margin: 20,
    marginBottom: SPACING * 4,
    height: SPACING * 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    color: 'white',
    width: GET_WIDTH * 0.9,
    maxWidth: GET_WIDTH * 0.9,
  },
});
