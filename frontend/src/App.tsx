import { BrowserRouter,Routes,Route } from "react-router-dom";
import {Sender} from "./components/sender";
import { Receiver } from "./components/receiver";

export default function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/sender" element={<Sender />} />
          <Route path="/receiver" element={<Receiver />} />
        </Routes>
      </BrowserRouter>

  );
}
