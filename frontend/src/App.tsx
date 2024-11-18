import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage.tsx';
import LoginPage from './components/login/Login.tsx';
import LoginRedirect from './components/login/Redirect.tsx';
import ProtectedRoute from './components/login/ProtectedRoute.tsx';
import UserAccount from './pages/userAccount.tsx';
import Chat from './pages/Chat'
import GameApp from './pages/game';
import Login2FA from './components/login/TwoFactor.tsx';

const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('authenticationToken'); 
		if (!token) {
			setIsAuthenticated(false);
		}
		else {
			axios.post('http://localhost:3001/login/verify-token', {
				token: token,
			})
			.then(response => {
				var verified = response.data;
				console.log('Token verified:', verified);
				setIsAuthenticated(verified);
			})
			.catch(err => {
				console.error('Error while verifying token:', err);
				setIsAuthenticated(false);
			});
		}
	}, []);
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LoginPage/>} />
				<Route path="/login/redirect" element={<LoginRedirect/>} />
				<Route path="/main" element={<MainPage/>} />
				<Route path="/user/:ID" element={<UserAccount/>} />
				<Route path="/chat" element={<Chat/>} />
				<Route
					path="/game"
					element={
						<ProtectedRoute isAuthenticated={isAuthenticated} element={GameApp}>
						</ProtectedRoute>
					}
				/>
				<Route path="/login/2fa" element={<Login2FA/>} />
			</Routes>
		</Router>
    );}

export default App;
