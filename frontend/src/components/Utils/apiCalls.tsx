import axios from 'axios';

const backend = process.env.REACT_APP_URL_BACKEND;

export const getToken = (code: string, state: string) =>
  axios.post(`${backend}/login/get-token`, {
    code: code,
    state: state,
  });

export const verifyOTP = (token: string, oneTimePassword: string) =>
  axios.post(`${backend}/two-factor/verify`, {
    oneTimePassword: oneTimePassword,
    token: token,
  });

export const markUserOnline = (token: string) => axios.post(`${backend}/login/online`, { token });

export const markUserOffline = (token: string) => axios.post(`${backend}/login/offline`, { token });

export const isTwoFactorEnabled = (token: string) =>
  axios.post(`${backend}/two-factor/is-enabled`, { token });

export const enableTwoFactor = (token: string) => axios.post(`${backend}/two-factor/enable`, { token });

export const disableTwoFactor = (token: string) => axios.post(`${backend}/two-factor/disable`, { token });

export const getQRCode = (token: string) => axios.post(`${backend}/two-factor/qrcode`, { token });

export const verifyToken = (token: string) => axios.post(`${backend}/login/verify-token`, { token});