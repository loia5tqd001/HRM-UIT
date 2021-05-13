import { usePermissions } from 'expo-permissions';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { Button, StyleSheet, View } from 'react-native';
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

export default function AttendanceScreen({ navigation }: { navigation: any }) {
  // const [capturedImage, setCapturedImage] = React.useState<any>(null)

  const [permission, askForPermission] = usePermissions(Permissions.LOCATION, { ask: true });
  const { user } = React.useContext(AuthContext)!;

  React.useEffect(() => {
    if (!permission || permission.status !== 'granted') {
      askForPermission();
    }
  }, []);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header navigation={navigation} />
      <View style={styles.container}>
        <Text style={{ fontSize: 13, fontWeight: '400', marginVertical: SPACING }}>
          No activities today yet...
        </Text>
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '500', marginTop: SPACING * 2 }}>
            Tap on camera <Text style={{ fontSize: 13, fontWeight: '400' }}>to clock in</Text>
          </Text>
          <Text></Text>
          {/* Body */}

          <CameraComponents />
          {/* Modal Clock */}

          <TouchableOpacity
            onPress={() => {
              // setPreviewVisible(true);
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
              Or, Clock in manually?
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
