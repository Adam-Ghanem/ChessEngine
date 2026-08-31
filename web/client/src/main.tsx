import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./production-mobile.css";
import "./production-redesign.css";
import "./product-surfaces.css";

createRoot(document.getElementById("root")!).render(<App />);
