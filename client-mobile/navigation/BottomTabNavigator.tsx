import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { activeColor } from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import { BottomTabParamList } from '../types';

// import { Ionicons } from '@expo/vector-icons';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Attendance"
      tabBarOptions={{ activeTintColor: activeColor }}
      // tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}
    >
      <BottomTab.Screen
        name="Attendance"
        component={TabOneScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="alarm-outline" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="TimeOff"
        component={TabTwoScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-outline" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}
