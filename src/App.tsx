import { Routes, Route, BrowserRouter } from "react-router-dom";
import Overview from "./pages/Overview";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path ="/server/:id element={<ServerView />}" />
      </Routes>
    </BrowserRouter>
  );
    
}

export default App
