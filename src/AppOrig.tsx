// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/core";
// import "./App.css";
import "./index.css"
// import Dashboard from "./components/dashboard/Dashboard.tsx";
// import RefPage from "@/pages/RefPage.tsx";
import Main from "@/components/layout/main.tsx";
// import Dashboard from "./components/dashboard/Dashboard.tsx";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    // <Dashboard />
    //  <RefPage />
      <Main />
  );
}

export default App;
