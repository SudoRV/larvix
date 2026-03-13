import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalProvider } from "./context/GlobalContext";

import Home from "./pages/Home";
import Workspace from "./pages/Workspace";

import "./App.css";

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace" element={<Workspace />} />
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;