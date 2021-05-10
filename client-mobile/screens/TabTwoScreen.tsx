import axios from 'axios';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Header from '../components/Header';
import ModalTimeOff from '../components/ModalTimeOff';
import { ListHistory } from '../components/TimeoffHistory';
import { BASE_URL } from '../constants/confgi';
import { primaryColor } from './../constants/Colors';

export default function TabTwoScreen({ navigation }: any) {
  const [show, setShow] = React.useState<boolean>(false);

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <View style={styles.container}>
        <Header navigation={navigation} />

        <View style={styles.separator} />
        <View
          style={{
            backgroundColor: primaryColor,
            alignSelf: 'flex-end',
            marginHorizontal: 25,
            marginBottom: 10,
            borderRadius: 2,
          }}
        >
          <TouchableOpacity style={{ width: '100%' }} onPress={() => setShow(true)}>
            <Text style={{ color: 'white', margin: 10 }}>+ New</Text>
          </TouchableOpacity>
        </View>
        <ListHistory />
      </View>
      <ModalTimeOff show={show} setShow={setShow} />
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
});
