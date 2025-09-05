import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
window.addEventListener("error", (event) => {
  console.log("Global error caught:", event.error);
  console.log("Stack trace:", event.error?.stack);
});

window.addEventListener("unhandledrejection", (event) => {
  console.log("Unhandled promise rejection:", event.reason);
  console.log("Stack trace:", event.reason?.stack);
});

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
    <App />
  //</StrictMode>,
)
