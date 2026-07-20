import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from './components/SignIn';
import HomePage from './pages/HomePage';
import ProtectedRoutes from './components/ProtectedRoutes';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
 
    <BrowserRouter>
    <Navbar/>
      <Routes>
        {/* Sign In Route */}
        <Route path="/signin" element={<SignIn />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* login k badd hoga acess token milne k baad */}
        {/* Redirect any other route to /signin by default */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>

    </>
  );
}

export default App;
