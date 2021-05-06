import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeAccessToken = async (value: string) => {
  try {
    await AsyncStorage.setItem("token", value);
  } catch (e) {
    // saving error
  }
};

export const storeRefreshToken = async (value: string) => {
  try {
    await AsyncStorage.setItem("refresh", value);
  } catch (e) {
    // saving error
  }
};

export const storeInfoUser = async (value: string) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('user', jsonValue)
  } catch (e) {
    // saving error
  }
};

export const getDataAsync = async (name: string) => {
  try {
    const value = await AsyncStorage.getItem(name);
    if (value !== null) {
      // value previously stored
      return value;
    }
  } catch (e) {
    // error reading value
  }
};

export const clearDataAsync = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    // error reading value
  }
};
