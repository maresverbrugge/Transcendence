import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage';
import LoginPage from './pages/login';
import LoginRedirect from './components/LoginRedirect';
import UserAccount from './pages/userAccount';
import Chat from './pages/Chat'
// import GameApp from './pages/game';
import Login2FA from './components/Login2FA';

const App = () => {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				<Route path="/login/redirect" element={<LoginRedirect />} />
				<Route path="/main" element={<MainPage />} />
				<Route path="/account" element={<UserAccount />} />
				<Route path="/chat" element={<Chat />} />
				{/* <Route path="/game" element={<GameApp />} /> */}
				<Route path="/login/2fa" element={<Login2FA />} />
			</Routes>
		</Router>
    );}
	
export default App;