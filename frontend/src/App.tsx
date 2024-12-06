import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage.tsx';
import Login from './components/Authentication/Login.tsx';
import SetUp2FA from './components/Authentication/SetUp2FA.tsx';
import Verify2FA from './components/Authentication/Verify2FA.tsx';
import LoginRedirect from './components/Authentication/LoginRedirect.tsx';
import ProtectedRoute from './components/Authentication/ProtectedRoute.tsx';
import LogOut from './components/Authentication/LogOut.tsx';
import UserAccount from './pages/UserAccount.tsx';
import UserProfile from './pages/UserProfile.tsx';
import Chat from './pages/Chat.tsx';
import Game from './pages/game.tsx';

const App = () => {
	return (
		<Router>
		  <Routes>
			<Route path="/" element={<Login />} />
			<Route path="/login/redirect" element={<LoginRedirect />} />
			<Route path="/login/set-up-2fa" element={<ProtectedRoute element={<SetUp2FA />} />} />
			<Route path="/login/verify-2fa" element={<Verify2FA />} />
			<Route path="/logout" element={<LogOut />} />
			<Route path="/main" element={<ProtectedRoute element={<MainPage />} />} />
			<Route path="/account/" element={<ProtectedRoute element={<UserAccount />} />} />
			<Route path="/profile/:ID" element={<ProtectedRoute element={<UserProfile />} />} />
			<Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
			<Route path="/game" element={<ProtectedRoute element={<Game />} />} />
		  </Routes>
		</Router>
	  );
}

export default App;
