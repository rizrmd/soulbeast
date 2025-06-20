import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import "./lib/init";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
