import React, { useState } from 'react';
import axios from 'axios';
import { StyleSheet, SafeAreaView, View, Text, Modal } from 'react-native';

import { BASE_URL } from '../constants/confgi';
import DropDownPicker from 'react-native-dropdown-picker';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { ListHistory } from '../components/ListHistory';
import ModalTimeOff from '../components/ModalTimeOff';
import { ListTimeOff, STATE } from '../constants/type';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';

export type TypeTimeOff = {
  label: string;
  value: string;
};
export default function TabTwoScreen() {
  const [show, setShow] = React.useState<boolean>(false);

  const [state, setState] = useState<STATE>(STATE.IDLE);

  const [items, setItems] = useState<TypeTimeOff[]>([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
  ]);
  const [listData, setListData] = useState<ListTimeOff[]>([]);

  // const [typeOff, setTypeOff] = React.useState([])

  const { user } = useContext(AuthContext)!;

  React.useEffect(() => {
    console.log('user', user);

    setState(STATE.LOADING);
    getListTimeOff().then(() => {
      setState(STATE.LOADED);
    });

    getTypeTimeOff();
  }, []);

  const getListTimeOff = async () => {
    await axios
      .get(`${BASE_URL}/time_off/`)
      .then((res) => {
        console.log('res', res.data);
        setListData(res.data);
      })
      .catch((er) => {
        console.log('er', er);
        setState(STATE.ERROR);
      });
  };

  const getTypeTimeOff = async () => {
    await axios
      .get(`${BASE_URL}/time_off_types/`)
      .then((res) => {
        // setTypeOff(res.data)
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
        setState(STATE.ERROR);
      });
  };

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>
        <View style={styles.separator} />
        <View
          style={{
            backgroundColor: '#2196F3',
            alignSelf: 'flex-end',
            marginHorizontal: 30,
            marginVertical: 10,
            padding: 10,
            borderRadius: 2,
          }}
        >
          <TouchableOpacity onPress={() => setShow(true)}>
            <Text style={{ color: 'white' }}>+ Create</Text>
          </TouchableOpacity>
        </View>
        {state === STATE.LOADING ? (
          <View>
            <Text>Loading..</Text>
          </View>
        ) : (
          <ScrollView style={{ flexGrow: 1, width: '90%' }}>
            <ListHistory list={listData} />
          </ScrollView>
        )}
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
