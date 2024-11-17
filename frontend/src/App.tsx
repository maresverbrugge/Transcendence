import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage.tsx';
import LoginPage from './components/login/Login.tsx';
import LoginRedirect from './components/login/Redirect.tsx';
import ProtectedRoute from './components/login/ProtectedRoute.tsx';
import UserAccount from './pages/userAccount.tsx';
import Chat from './pages/Chat'
import GameApp from './pages/game';
import Login2FA from './components/login/TwoFactor.tsx';

var isAuthenticated = false;

const App = () => {
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
