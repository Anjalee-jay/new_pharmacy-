import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Prescription from './pages/Prescription';
import View from'./pages/View';

function AppContent() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div style={{ display: 'flex' }}>
            {!isLoginPage && <SideBar />} 
            <div style={{ flex: 1, marginLeft: !isLoginPage ? '250px' : '0', paddingTop: !isLoginPage ? '60px' : '0' }}>
                {!isLoginPage && <TopBar />}
                <div style={{ marginTop: !isLoginPage ? '60px' : '0' }}>
                    <Routes>
                    
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/prescription" element={<Prescription />} />
                        <Route path="/view" element={<View />} />
                  
                        
                    </Routes>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
