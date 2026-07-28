import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from './components/SignIn';
import HomePage from './pages/HomePage';
import ProtectedRoutes from './components/ProtectedRoutes';
import Navbar from './components/Navbar';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailsPage from './pages/EventDetailsPage';
function App() {
  return (
    <>
 
    <BrowserRouter>
    <Navbar/>
      <Routes>
        {/* Sign In Route */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<HomePage />} />
        <Route path='/eventdetails/:id' element={<EventDetailsPage/>}/>
        <Route element={<ProtectedRoutes />}>
     
          <Route path='/register/event' element={<CreateEventPage/>}/>
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
