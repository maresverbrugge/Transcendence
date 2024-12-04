import axios from 'axios';


export const getToken = (code: string, state: string) =>
	axios.post('http://localhost:3001/login/get-token', {
		code: code,
		state: state,
	});


export const verifyOTP = (userID: string, oneTimePassword: string) =>
  axios.post('http://localhost:3001/two-factor/verify', {
    userID,
    oneTimePassword,
  });


export const markUserOnline = (token: string) =>
  axios.post('http://localhost:3001/login/online', { token });


export const markUserOffline = (userID: number) =>
  axios.post('http://localhost:3001/login/offline', { userID });


export const isTwoFactorEnabled = (intraName: string) =>
	axios.post('http://localhost:3001/two-factor/is-enabled', { intraName });


export const enableTwoFactor = (userID: number) =>
	axios.post('http://localhost:3001/two-factor/enable', { userID });


export const disableTwoFactor = (userID: number) =>
	axios.post('http://localhost:3001/two-factor/disable', { userID });


export const getQRCode = (userID: number) =>
	axios.post('http://localhost:3001/two-factor/qrcode', { userID });


export const getUserIDFromToken = (token: string) =>
	axios.post('http://localhost:3001/login/user-id', { token });