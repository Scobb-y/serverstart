import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Servers from "./pages/Servers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servers" element={<Servers />} />
      </Routes>
    </BrowserRouter>
  );
}
