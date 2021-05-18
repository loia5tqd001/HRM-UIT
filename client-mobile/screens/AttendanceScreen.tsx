import { usePermissions } from 'expo-permissions';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, View } from 'react-native';
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
import { ForwardRefExoticComponent, RefAttributes } from 'react';

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

interface Location {
  id: number;
  name: string;
  province: string;
  city: string;
  address: string;
  zipcode: string;
  phone: string;
  fax: string;
  note: string;
  country: number;

  accurate_address: string;
  radius: number;
  allow_outside: boolean;
  lng: number;
  lat: number;
}

// Declare typescript with useImperativeHandle: https://gist.github.com/Venryx/7cff24b17867da305fff12c6f8ef6f96
type Handle<T> = T extends ForwardRefExoticComponent<RefAttributes<infer T2>> ? T2 : never;

export default function AttendanceScreen({ navigation }: { navigation: any }) {
  const [permission, askForPermission] = usePermissions(Permissions.LOCATION, { ask: true });
  const { user } = React.useContext(AuthContext)!;
  const [outside, setOutside] = React.useState(true);
  const [nextStep, setNextStep] = React.useState<'clock in' | 'clock out'>('clock in');
  const [lastAction, setLastAction] = React.useState<string>('No activities today yet...');
  const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject['coords']>();
  const [isReady, setIsReady] = React.useState(false);

  const [employeeLocation, setEmployeeLocation] = React.useState<Location>();
  const modalClockInRef = React.useRef<Handle<typeof ModalClockIn>>();

  React.useEffect(() => {
    setIsReady(false);
    Promise.all([
      axios.get(`/employees/${user?.id}/jobs/`).then((it) => it.data?.[0].location),
      axios.get<Location[]>('/locations/').then((it) => it.data),
    ])
      .then(([location, locations]) => {
        const matchedLocation = locations.find((it) => it.name === location);
        if (!matchedLocation) {
          Alert.alert('Cannot find location for this employee');
        }
        setEmployeeLocation(matchedLocation);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchAttendanceStatus = React.useCallback(() => {
    return axios
      .get<EmployeeAttendance[]>(`/employees/${user?.id}/attendance/`)
      .then((fetchData) => {
        const todayData = fetchData.data
          .reverse()
          .find((it) => moment(it.date).isSame(moment(), 'day'));
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
    if (!employeeLocation) return;

    const setupLocation = async () => {
      try {
        await Location.getCurrentPositionAsync({}).then((location) => {
          setCurrentLocation(location.coords);
          const distance = getPreciseDistance(location.coords, employeeLocation!);
          if (distance < employeeLocation!.radius) setOutside(false);
        });

        const TASK_NAME = 'GEOFENCING';

        await Location.startGeofencingAsync(TASK_NAME, [
          {
            latitude: employeeLocation?.lat,
            longitude: employeeLocation?.lng,
            radius: employeeLocation?.radius,
          },
        ]);

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
      } catch (err) {
        console.log('Error setup location', err);
      } finally {
        setIsReady(true);
      }
    };

    if (!permission || permission.status !== 'granted') {
      askForPermission().then(setupLocation);
    } else {
      setupLocation();
    }
  }, [employeeLocation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header navigation={navigation} />
      {!isReady ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator style={{ width: 100, height: 100 }} />
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={{ color: '#ff4d4f' }}>
            <FontAwesome name="map-marker" />{' '}
            {outside ? 'Outside working area' : employeeLocation!.name}
          </Text>
          <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '400', marginTop: SPACING * 2 }}>
              {lastAction}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '500' }}>
              Tap on camera <Text style={{ fontSize: 13, fontWeight: '400' }}>to {nextStep}</Text>
            </Text>
            <Text></Text>
            {/* Body */}

            <CameraComponents />
            {/* Modal Clock */}

            <TouchableOpacity
              onPress={() => {
                if (outside && !employeeLocation?.allow_outside) {
                  Alert.alert('Your office does not allow to work outside designated area!');
                  return;
                }
                modalClockInRef.current?.openModal();
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
            ref={modalClockInRef}
            outside={outside}
            nextStep={nextStep}
            location={{
              lat: currentLocation?.latitude,
              lng: currentLocation?.longitude,
            }}
            fetchAttendanceStatus={fetchAttendanceStatus}
          />
        </View>
      )}
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
