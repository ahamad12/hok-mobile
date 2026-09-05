import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch } from '@react-native-community/netinfo';
import axios, { CanceledError } from 'axios';

import Environment from '@/config/Environment';
import { NetworkStatus } from '@/constants/AppConstants';
import { debouncedNoInternetHandler } from '@/utils/NetworkManager';

const API = axios.create({
  baseURL: Environment.apiUrl,
});

// Request Interceptor
API.interceptors.request.use(async (config) => {
  const state = await fetch();
  const networkStatus = state.isConnected
    ? NetworkStatus.ONLINE
    : NetworkStatus.OFFLINE;
  debouncedNoInternetHandler(networkStatus);

  if (!state.isConnected) {
    throw new CanceledError('No internet connection detected.');
  }

  const token = await AsyncStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['Content-Type'] = 'application/json';

  return config;
});

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      debouncedNoInternetHandler(NetworkStatus.OFFLINE);
    }
    if (error.code === 'ERR_NETWORK') {
      debouncedNoInternetHandler(NetworkStatus.OFFLINE);
    }
    // Always re-reject the ORIGINAL error — status, response.data, code all
    // stay intact so ApiErrors.ts can actually read the backend's error body.
    return Promise.reject(error);
  },
);

export default API;
