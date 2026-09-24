import '@/styles/globals.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

createRoot(container).render(
  // StrictMode double-invokes effects in development. Every animation in this
  // app is wrapped in a GSAP context that reverts on cleanup, so it survives
  // that — which is exactly the point of testing under StrictMode.
  <StrictMode>
    <App />
  </StrictMode>,
);
