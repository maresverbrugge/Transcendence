import React from 'react';
import App from './App';
import './index.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootswatch/dist/quartz/bootstrap.min.css';

import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root') as HTMLElement;
const root = createRoot(domNode);

root.render(<App />);
