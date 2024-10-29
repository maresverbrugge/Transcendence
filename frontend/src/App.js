import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
// import GameApp from './pages/game';
import LoginPage from './pages/login';
import LoginRedirect from './components/LoginRedirect';
// import Login2FA from './components/Login2FA';
import Chat from './pages/Chat'

const App = () => {
	return (
        <div>
            <LoginPage />
            {/* <GameApp /> */}
        </div>,

		<Router>
			<Routes>
				<Route path="/" element={<LoginPage />} />
				{/* <Route path="/game" element={<GameApp />} /> */}
				<Route path="/login/redirect" element={<LoginRedirect />} />
				{/* <Route path="/login/2fa" element={<Login2FA />} /> */}
				<Route path="/chat" element={<Chat />} />
			</Routes>
		</Router>
    );}

export default App;