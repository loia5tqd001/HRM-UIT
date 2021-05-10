import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DetailInformation from '../components/DetailInformation';
import Header from '../components/Header';
import { GET_WIDTH } from '../constants/confgi';
import { ICON_IMG } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { user } = React.useContext(AuthContext)!;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ height: 150 }}>
        <Header navigation={navigation} />
        <View style={styles.container}>
          <DetailInformation
            imgUri={user ? user.avatar : ICON_IMG}
            name={user ? user.last_name : ''}
          />
        </View>
      </View>

      {/* Body */}
      <View
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          //   backgroundColor: '#221',
        }}
      >
        {/* Clock In */}
        <View
          style={{
            backgroundColor: '#2322',
            width: GET_WIDTH * 0.7,
            alignSelf: 'center',
            borderRadius: 2,
            // paddingHorizontal:60,
            // paddingVertical:50
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Root')}>
            <View
              style={{
                padding: 30,
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 22 }}>Clock In</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Time off */}
        <View
          style={{
            backgroundColor: '#2322',
            width: GET_WIDTH * 0.7,
            alignSelf: 'center',
            borderRadius: 2,
            marginTop: GET_WIDTH * 0.2,
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate('TimeOff')}>
            <View
              style={{
                padding: 30,
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 22 }}>Time Off</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'#432'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
