import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ProjectEditor from './pages/ProjectEditor';
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/project/:id" element={<ProjectEditor />} />
      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);
