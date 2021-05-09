import axios from 'axios';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Header from '../components/Header';
import ModalTimeOff from '../components/ModalTimeOff';
import { ListHistory } from '../components/TimeoffHistory';
import { BASE_URL } from '../constants/confgi';
import { primaryColor } from './../constants/Colors';

export type TypeTimeOff = {
  label: string;
  value: string;
};
export default function TabTwoScreen({ navigation }: any) {
  const [show, setShow] = React.useState<boolean>(false);

  const [items, setItems] = useState<TypeTimeOff[]>([]);

  React.useEffect(() => {
    getTypeTimeOff();
  }, []);

  const getTypeTimeOff = async () => {
    await axios
      .get(`${BASE_URL}/time_off_types/`)
      .then((res) => {
        return res.data;
      })
      .then((list) => {
        var arr: TypeTimeOff[] = [];
        list.forEach((element: any) => {
          var obj = { label: element.name, value: element.name };
          arr.push(obj);
        });
        setItems(arr);
      })
      .catch((er) => {
        console.log('er', er);
      });
  };

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
            padding: 10,
            borderRadius: 2,
          }}
        >
          <TouchableOpacity onPress={() => setShow(true)}>
            <Text style={{ color: 'white' }}>+ New</Text>
          </TouchableOpacity>
        </View>
        <ListHistory />
      </View>
      <ModalTimeOff items={items} setItems={setItems} show={show} setShow={setShow} />
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
