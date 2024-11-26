import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/landingPage.tsx';
import LoginPage from './components/Authentication/LoginPage.tsx';
import LoginRedirect from './components/Authentication/LoginRedirect.tsx';
import ProtectedRoute from './components/Authentication/ProtectedRoute.tsx';
import UserAccount from './pages/UserAccount.tsx';
import UserProfile from './pages/UserProfile.tsx';
import Chat from './pages/Chat.tsx';
// import GameApp from './pages/game';
// import Login2FA from './components/Authentication/TwoFactor.tsx';

const App = () => {
	return (
		<Router>
		  <Routes>
			<Route path="/" element={<LoginPage />} />
			<Route path="/login/redirect" element={<LoginRedirect />} />
			<Route path="/main" element={<ProtectedRoute element={<MainPage />} />} />
			<Route path="/account/:ID" element={<ProtectedRoute element={<UserAccount />} />} />
			<Route path="/profile/:ID" element={<ProtectedRoute element={<UserProfile />} />} />
			<Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
			{/* <Route path="/game" element={<ProtectedRoute element={<GameApp />} />} /> */}
			{/* <Route path="/login/2fa" element={<ProtectedRoute element={<Login2FA />} />} /> */}
		  </Routes>
		</Router>
	  );
}

export default App;
