import { usePermissions } from 'expo-permissions';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraComponents from '../components/CameraComponents';
import ModalClock from '../components/ClockManual';
import DetailInformation from '../components/DetailInformation';
import Header from '../components/Header';
import { Text } from '../components/Themed';
import { primaryColor } from '../constants/Colors';
import { ICON_IMG, SPACING } from '../constants/Layout';
import { AuthContext } from '../Context/AuthContext';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalClockIn from '../components/ModalClockIn';
import * as Location from 'expo-location';
import { LocationGeofencingEventType } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getPreciseDistance } from 'geolib';
import axios from '../commons/axios';
import moment from 'moment';

interface EmployeeAttendance {
  id: number;
  owner: number;
  date: moment.Moment | string;
  tracking_data: {
    check_in_time: moment.Moment | string;
    check_in_outside: boolean;
    check_in_note: string | null;
    check_in_lat: number;
    check_in_lng: number;
    check_out_time: moment.Moment | string | null;
    check_out_outside: boolean | null;
    check_out_note: string | null;
    check_out_lat: number | null;
    check_out_lng: number | null;
    location: string | null;
    actual_work_hours: number;
    ot_work_hours: number;
  }[];
}

export default function AttendanceScreen({ navigation }: { navigation: any }) {
  // const [capturedImage, setCapturedImage] = React.useState<any>(null)

  const [permission, askForPermission] = usePermissions(Permissions.LOCATION, { ask: true });
  const [show, setShow] = React.useState(false);
  const { user } = React.useContext(AuthContext)!;
  const [outside, setOutside] = React.useState(true);
  const [nextStep, setNextStep] = React.useState<'clock in' | 'clock out'>('clock in');
  const [lastAction, setLastAction] = React.useState<string>('No activities today yet...');
  const [location, setLocation] = React.useState<Location.LocationObject['coords']>();

  const fakeLocation = {
    accurate_address: '67 Đường số 6, Hiệp Bình Chánh, Thủ Đức, Thành phố Hồ Chí Minh, Vietnam',
    address: '',
    allow_outside: true,
    city: 'Tân bình',
    country: 1,
    enable_geofencing: true,
    fax: '',
    id: 1,
    lat: 10.83048641165497,
    lng: 106.71720607599335,
    name: 'Chi nhánh Tân Bình',
    note: 'ChIJBbyxS4codTERFCdOlG06l60',
    phone: '',
    province: 'Hồ Chí Minh',
    radius: 500,
    zipcode: '',
  };

  const fetchAttendanceStatus = React.useCallback(() => {
    axios.get<EmployeeAttendance[]>(`/employees/${user?.id}/attendance/`).then((fetchData) => {
      const todayData = fetchData.data.find((it) => moment(it.date).isSame(moment(), 'day'));
      if (todayData?.tracking_data.length) {
        // Handle for: firstClock, lastClockOut, lastAction, nextStep
        setNextStep(
          todayData.tracking_data[todayData.tracking_data.length - 1].check_out_time
            ? 'clock in'
            : 'clock out',
        );

        const lastRecord = todayData.tracking_data[todayData.tracking_data.length - 1];
        setLastAction(
          lastRecord.check_out_time
            ? `Clocked out at ${moment(lastRecord.check_out_time).format('HH:mm')}`
            : `Clocked in at ${moment(lastRecord.check_in_time).format('HH:mm')}`,
        );
      }
    });
  }, []);

  React.useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  React.useEffect(() => {
    const setupLocation = () => {
      Location.getCurrentPositionAsync({}).then((location) => {
        setLocation(location.coords);
        const distance = getPreciseDistance(location.coords, fakeLocation);
        if (distance < fakeLocation.radius) setOutside(false);
      });
      const TASK_NAME = 'GEOFENCING';
      TaskManager.defineTask(TASK_NAME, ({ data, error }) => {
        if (error) {
          Alert.alert(error.message);
          return;
        }
        if ((data as any).eventType === LocationGeofencingEventType.Enter) {
          setOutside(false);
        } else if ((data as any).eventType === LocationGeofencingEventType.Exit) {
          setOutside(true);
        }
      });
      Location.startGeofencingAsync(TASK_NAME, [
        { latitude: fakeLocation.lat, longitude: fakeLocation.lng, radius: fakeLocation.radius },
      ]);
    };

    if (!permission || permission.status !== 'granted') {
      askForPermission().then(setupLocation);
    } else {
      setupLocation();
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header navigation={navigation} />
      <View style={styles.container}>
        <Text style={{ color: '#ff4d4f' }}>
          <FontAwesome name="map-marker" /> {outside ? 'Outside working area' : fakeLocation.name}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '400', marginVertical: SPACING }}>
          {lastAction}
        </Text>
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '500', marginTop: SPACING * 2 }}>
            Tap on camera <Text style={{ fontSize: 13, fontWeight: '400' }}>to {nextStep}</Text>
          </Text>
          <Text></Text>
          {/* Body */}

          <CameraComponents setShowPopup={setShow} />
          {/* Modal Clock */}

          <TouchableOpacity
            onPress={() => {
              setShow(true);
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '500',
                color: primaryColor,
                marginTop: SPACING,
                padding: SPACING,
              }}
            >
              Or, {nextStep} manually?
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <ModalClockIn
          show={show}
          setShow={setShow}
          outside={outside}
          nextStep={nextStep}
          location={{
            lat: location?.latitude,
            lng: location?.longitude,
          }}
          fetchAttendanceStatus={fetchAttendanceStatus}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#432',
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
