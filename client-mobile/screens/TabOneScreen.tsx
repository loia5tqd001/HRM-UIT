import * as React from 'react'
import { StyleSheet, Image, View, Dimensions } from 'react-native'

import EditScreenInfo from '../components/EditScreenInfo'
import { Text } from '../components/Themed'
import {
  BACKGROUND_IMG,
  getWindowSize,
  ICON_IMG,
  SPACING,
} from '../constants/Layout'
import { FontAwesome } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import CameraComponents from '../components/CameraComponents'
import { colorText } from '../constants/Colors'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import ModalClock from '../components/ClockManual'
import Header from '../components/Header'
import DetailInformation from '../components/DetailInformation'
import { AuthContext } from '../Context/AuthContext'

export default function TabOneScreen() {
  // const [capturedImage, setCapturedImage] = React.useState<any>(null)
  const [previewVisible, setPreviewVisible] = React.useState(false)

  const { user } = React.useContext(AuthContext)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <Header />
        <View style={styles.container}>
          <DetailInformation
            imgUri={user ? user.avatar : ICON_IMG}
            name={user ? user.last_name : ''}
          />

          {/* Body */}
          <CameraComponents />
          {/*  */}
          {/* Modal Clock */}
          <ModalClock
            modalVisible={previewVisible}
            setModalVisible={(c: boolean) => setPreviewVisible(c)}
          />
          <TouchableOpacity
            onPress={() => {
              setPreviewVisible(true)
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: '100', marginTop: SPACING }}
            >
              Clock in manual
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
})
