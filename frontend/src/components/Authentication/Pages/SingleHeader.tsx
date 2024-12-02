import React from 'react';

interface SingleHeaderProps {
	text: string;
}

const SingleHeader: React.FC<SingleHeaderProps> = ({ text }) => {
	return (
		<div>
			<h1>{text}</h1>
		</div>
	);
}

export default SingleHeader;