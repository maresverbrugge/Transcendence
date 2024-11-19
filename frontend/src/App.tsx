import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage.tsx';
import LoginPage from './components/Login/Login.tsx';
import LoginRedirect from './components/Login/Redirect.tsx';
import ProtectedRoute from './components/Login/ProtectedRoute.tsx';
import UserAccount from './pages/UserAccount.tsx';
import UserProfile from './pages/UserProfile.tsx';
// import Chat from './pages/Chat';
import GameApp from './pages/game';
import Login2FA from './components/Login/TwoFactor.tsx';

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
				<Route path="/account/:ID" element={<UserAccount/>} />
				<Route path="/profile/:ID" element={<UserProfile/>} />
				{/* <Route path="/chat" element={<Chat/>} /> */}
				<Route path="/game" element={<GameApp/>} />
				<Route path="/login/2fa" element={<Login2FA/>} />
			</Routes>
		</Router>
    );}

export default App;
