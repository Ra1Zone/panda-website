import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const storedTheme = localStorage.getItem("panda-theme") === "light" ? "light" : "dark";
document.documentElement.dataset.theme = storedTheme;
document.documentElement.classList.toggle("dark", storedTheme === "dark");
document.documentElement.style.colorScheme = storedTheme;

createRoot(document.getElementById("root")!).render(<App />);
