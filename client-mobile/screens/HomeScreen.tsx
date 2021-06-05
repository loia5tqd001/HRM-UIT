import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DetailInformation from '../components/DetailInformation';
import Header from '../components/Header';
import { GET_WIDTH } from '../constants/config';
import { BORDER_RADIUS, ICON_IMG, SPACING } from '../constants/Layout';
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
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('BottomNav', { screen: 'Attendance' })}
          style={styles.bigButton}
        >
          <Text style={{ textAlign: 'center', fontSize: 22 }}>Clock In/Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('BottomNav', { screen: 'TimeOff' })}
          style={styles.bigButton}
        >
          <Text style={{ textAlign: 'center', fontSize: 22 }}>Time Off</Text>
        </TouchableOpacity>
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
    // backgroundColor: 'red',
    marginTop: SPACING * 2,
  },
  bigButton: {
    padding: SPACING * 3.5,
    margin: 5,
    // width: '90%',
    backgroundColor: 'white',
    borderColor: 'rgba(0,0,0,0.12)',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS,
    width: GET_WIDTH * 0.75,
    marginBottom: SPACING * 4,
  },
});
