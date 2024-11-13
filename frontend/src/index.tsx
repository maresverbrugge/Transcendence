import React from 'react';
import App from './App.tsx';
import './index.css';

import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root') as HTMLElement;
const root = createRoot(domNode);

root.render(<App />);
