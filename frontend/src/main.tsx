import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const blocked =
    key === "f12" ||
    ((event.ctrlKey || event.metaKey) && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    ((event.ctrlKey || event.metaKey) && key === "u");

  if (blocked) {
    event.preventDefault();
    event.stopPropagation();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
