import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CertificateDesignPage from "./pages/CertificateDesignPage";
import CertificateViewPage from "./pages/CertificateViewPage";

function App() {
  return (
    <Routes>
      <Route path="/" index element={<HomePage />} />
      <Route path="/design" element = {<CertificateDesignPage/>} />
      <Route path="/view" element = {<CertificateViewPage/>} />
    </Routes>
  );
}

export default App;
