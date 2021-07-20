import { usePermissions } from 'expo-permissions';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { ActivityIndicator, Alert, Button, ImageBackground, StyleSheet, View } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import CameraComponents from '../components/CameraComponents';
import ModalClock from '../components/ClockManual';
import DetailInformation from '../components/DetailInformation';
import Header from '../components/Header';
import { Text } from '../components/Themed';
import { primaryColor } from '../constants/Colors';
import { BACKGROUND, ICON_IMG, SPACING } from '../constants/Layout';
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
import { WithBackground } from './../components/WithBackground';

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

interface AttendanceHelper {
  next_step: 'clock in' | 'clock out';
  first_clock_in: moment.Moment | string | null;
  last_clock_out: moment.Moment | string | null;
  last_action: 'clock in' | 'clock out' | null;
  last_action_at: moment.Moment | string | null;
  location: Location | null;
}

interface AppConfig {
  monthly_start_date: number;
  early_check_in_minutes: number;
  ot_point_rate: number;
  require_face_id: boolean;
  allow_unrecognised_face: boolean;
}

// Declare typescript with useImperativeHandle: https://gist.github.com/Venryx/7cff24b17867da305fff12c6f8ef6f96
type Handle<T> = T extends ForwardRefExoticComponent<RefAttributes<infer T2>> ? T2 : never;

export default function AttendanceScreen({ navigation }: { navigation: any }) {
  const [permission, askForPermission] = usePermissions(Permissions.LOCATION, { ask: true });
  const [outside, setOutside] = React.useState(true);
  const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject['coords']>();
  const [isReady, setIsReady] = React.useState(false);
  const [appConfig, setAppConfig] = React.useState<AppConfig>();
  const modalClockInRef = React.useRef<Handle<typeof ModalClockIn>>();
  const [attendanceState, setAttendanceState] = React.useState<AttendanceHelper>();

  const refreshAttendanceState = React.useCallback(async () => {
    setIsReady(false);
    try {
      await Promise.all([
        axios.get<AttendanceHelper>(`/attendance_helper/`).then((it) => {
          setAttendanceState(it.data);
        }),
        axios.get<AppConfig>('/app_config/').then((it) => {
          setAppConfig(it.data);
        }),
      ]);
    } finally {
      setIsReady(true);
    }
  }, []);

  React.useEffect(() => {
    refreshAttendanceState();
  }, []);

  const setNextStep = (next_step: AttendanceHelper['next_step']) => {
    setAttendanceState({ ...attendanceState, next_step });
  };

  React.useEffect(() => {
    if (!attendanceState?.location) return;

    const setupLocation = async () => {
      try {
        await Location.getCurrentPositionAsync({}).then((location) => {
          setCurrentLocation(location.coords);
          const distance = getPreciseDistance(location.coords, attendanceState.location!);
          if (distance < attendanceState.location!.radius) setOutside(false);
        });

        const TASK_NAME = 'GEOFENCING';

        await Location.startGeofencingAsync(TASK_NAME, [
          {
            latitude: attendanceState.location?.lat,
            longitude: attendanceState.location?.lng,
            radius: attendanceState.location?.radius,
          },
        ]);

        TaskManager.defineTask(TASK_NAME, ({ data, error }) => {
          if (error) {
            throw error;
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
  }, [attendanceState?.location]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WithBackground>
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
              {outside ? 'Outside working area' : attendanceState.location!.name}
            </Text>
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '400', marginTop: SPACING * 2 }}>
                {attendanceState.last_action
                  ? `Last activity: ${attendanceState.last_action} at ${moment(
                      attendanceState.last_action_at,
                    ).format('HH:mm')}`
                  : 'No activities to day yet...'}
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '500' }}>
                Tap on camera{' '}
                <Text style={{ fontSize: 13, fontWeight: '400' }}>
                  to {attendanceState.next_step}
                </Text>
              </Text>
              <Text></Text>
              {/* Body */}
              <CameraComponents
                nextStep={attendanceState.next_step}
                setNextStep={setNextStep}
                onSuccess={refreshAttendanceState}
                location={{
                  lat: currentLocation?.latitude,
                  lng: currentLocation?.longitude,
                }}
              />
              {/* Modal Clock */}
              {!appConfig?.require_face_id && (
                <TouchableOpacity
                  onPress={() => {
                    if (outside && !attendanceState.location?.allow_outside) {
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
                    Or, {attendanceState.next_step} manually?
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <ModalClockIn
              ref={modalClockInRef}
              outside={outside}
              nextStep={attendanceState.next_step}
              location={{
                lat: currentLocation?.latitude,
                lng: currentLocation?.longitude,
              }}
              onSuccess={refreshAttendanceState}
            />
          </View>
        )}
      </WithBackground>
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
