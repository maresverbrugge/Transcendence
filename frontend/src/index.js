// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { reportWebVitals } from './reportWebVitals'; // Correct import

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
//     console.log('swUrl', swUrl);
//     navigator.serviceWorker.register(swUrl)
//       .then(registration => {
//         registration.onupdatefound = () => {
//           const installingWorker = registration.installing;
//           installingWorker.onstatechange = () => {
//             if (installingWorker.state === 'installed') {
//               if (navigator.serviceWorker.controller) {
//                 // New content is available; please refresh.
//                 console.log('New content is available; please refresh.');
//               } else {
//                 // Content is cached for offline use.
//                 console.log('Content is cached for offline use.');
//               }
//             }
//           };
//         };
//       })
//       .catch(error => {
//         console.error('Error during service worker registration:', error);
//       });
//   });
// }


// reportWebVitals();
