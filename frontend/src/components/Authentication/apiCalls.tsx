import axios from 'axios';

export const verifyOTP = (userID: string, oneTimePassword: string) =>
  axios.post('http://localhost:3001/two-factor/verify', {
    userID,
    oneTimePassword,
  });

export const markUserOnline = (token: string) =>
  axios.post('http://localhost:3001/login/online', { token });

export const getToken = (code: string, state: string) =>
	axios.post('http://localhost:3001/login/get-token', {
		code: code,
		state: state,
	});

export const isTwoFactorEnabled = (intraName: string) =>
	axios.post('http://localhost:3001/two-factor/is-enabled', { intraName });
