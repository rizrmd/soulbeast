import ReactDOM from "react-dom/client";
import Router from "./components/Router";
import "./App.css";
import "./lib/init";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<Router />);
}
