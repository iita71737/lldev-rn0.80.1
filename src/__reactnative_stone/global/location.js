import Geolocation from '@react-native-community/geolocation';
import axios from 'axios'
import Config from "react-native-config";
import { Platform } from 'react-native';

export const getLocation = async () => {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'android') {
      Geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords?.latitude;
          const longitude = position.coords?.longitude;
          const myLocation = {
            latitude: latitude,
            longitude: longitude,
          };
          resolve(myLocation);
        },
        error => {
          console.log('获取地理位置失败：', error.message);
          reject(error);
        },
      );
    }
    if (Platform.OS === 'ios') {
      Geolocation.getCurrentPosition(
        async position => {
          const latitude = position.coords?.latitude;
          const longitude = position.coords?.longitude;
          const myLocation = {
            latitude: latitude,
            longitude: longitude,
          };
          resolve(myLocation);
        },
        error => {
          console.log('获取地理位置失败：', error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }
  });
};

export const getGeocode = async (latitude, longitude) => {
  const apiKey = Config.GOOGLE_GEOCODING_API_KEY ? Config.GOOGLE_GEOCODING_API_KEY : null;
  console.log(apiKey, 'apiKey');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data.results?.length > 0) {
      // 格式化完整地址
      // const formattedAddress = data.results[0].formatted_address;
      // return formattedAddress
      return data
    } else {
      return ('CAN NOT GET LOCATION');
    }
  } catch (error) {
    return ('CAN NOT GET LOCATION');
    console.error(error);
  }
};
