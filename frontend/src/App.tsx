import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage';
import Login from './components/Authentication/Login';
import SetUp2FA from './components/Authentication/SetUp2FA';
import Verify2FA from './components/Authentication/Verify2FA';
import LoginRedirect from './components/Authentication/LoginRedirect';
import ProtectedRoute from './components/Authentication/ProtectedRoute';
import LogOut from './components/Authentication/LogOut';
import UserAccount from './pages/UserAccount';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import ErrorHandler from './components/ErrorHandler';
// import GameApp from './pages/game';

const App = () => {
	return (
		<Router>
		  <ErrorHandler/>
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
			{/* <Route path="/game" element={<ProtectedRoute element={<GameApp />} />} /> */}
		  </Routes>
		</Router>
	  );
}

export default App;
