import React from 'react';
import {
  SafeAreaView,
  ImageBackground,
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import DetailInformation from '../components/DetailInformation';
import Header from '../components/Header';
import { GET_WIDTH } from '../constants/config';
import {
  ATTENDANCE_ICON,
  BACKGROUND,
  BORDER_RADIUS,
  ICON_IMG,
  SPACING,
  TIMEOFF_ICON,
} from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';
// import AttendanceIcon from '../assets/images/schedule.svg';
// import TimeoffIcon from '../assets/images/travelling.svg';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { user } = React.useContext(AuthContext)!;

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ImageBackground
        source={BACKGROUND}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <View style={{ height: 50 }}>
          <Header navigation={navigation} />
        </View>
        <View style={styles.container}>
          <DetailInformation
            imgUri={user ? user.avatar : ICON_IMG}
            name={user ? user.first_name : ''}
          />
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
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Image source={ATTENDANCE_ICON} style={{ width: 60, height: 60 }} />
            </View>
            <Text style={{ textAlign: 'center', fontSize: 15, marginTop: 5, color: '#444' }}>
              Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('BottomNav', { screen: 'TimeOff' })}
            style={styles.bigButton}
          >
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Image source={TIMEOFF_ICON} style={{ width: 60, height: 60 }} />
            </View>
            <Text style={{ textAlign: 'center', fontSize: 15, marginTop: 5, color: '#444' }}>
              Time Off
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
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
    padding: SPACING * 2,
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
