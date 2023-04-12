import React from "react";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScheduleGrid from "./components/ScheduleGrid";

function App() {
  return (
    <>
      <ToastContainer theme="colored" hideProgressBar />
      <ScheduleGrid />
    </>
  );
}

export default App;
