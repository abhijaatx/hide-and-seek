import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import App from './App.jsx';
import "./App.css";

function Launch() {
    return (

        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/game" element={<App />} />
        </Routes>



    );
}

export default Launch;