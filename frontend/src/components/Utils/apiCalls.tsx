import axios from 'axios';

export const getToken = (code: string, state: string) =>
  axios.post('http://localhost:3001/login/get-token', {
    code: code,
    state: state,
  });

export const verifyOTP = (token: string, oneTimePassword: string) =>
  axios.post('http://localhost:3001/two-factor/verify', {
    oneTimePassword: oneTimePassword,
    token: token,
  });

export const markUserOnline = (token: string) => axios.post('http://localhost:3001/login/online', { token });

export const markUserOffline = (token: string) => axios.post('http://localhost:3001/login/offline', { token });

export const isTwoFactorEnabled = (token: string) =>
  axios.post('http://localhost:3001/two-factor/is-enabled', { token });

export const enableTwoFactor = (token: string) => axios.post('http://localhost:3001/two-factor/enable', { token });

export const disableTwoFactor = (token: string) => axios.post('http://localhost:3001/two-factor/disable', { token });

export const getQRCode = (token: string) => axios.post('http://localhost:3001/two-factor/qrcode', { token });
