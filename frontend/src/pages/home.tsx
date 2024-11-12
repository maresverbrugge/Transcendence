import React from 'react';

// Home page that is shown when the user goes to localhost:3000

const Home: React.FC = () => {
	return (
		<div>
			<h1>Home</h1>
			<p>Ga naar localhost:3000/game voor de game en localhost:3000/login voor de login-pagina!</p>
		</div>
	);
};

export default Home;