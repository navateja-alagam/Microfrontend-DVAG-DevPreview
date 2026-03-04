import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import DealerLocator from './components/DealerLocator';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dealer-locator" element={<DealerLocator />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<DealerLocator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
