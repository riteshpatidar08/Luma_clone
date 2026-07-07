import * as React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SignIn } from "./components/SignIn"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign In Route */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Redirect any other route to /signin by default */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
