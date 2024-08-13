import {useState} from "react";
import reactLogo from "./assets/react.svg";
import {invoke} from "@tauri-apps/api/core";
import "./App.css";
import {Button} from "@/components/ui/button.tsx";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        // setGreetMsg(await invoke("greet", { name }));
    }

    async function test() {
        // await sendMessage(renameClassifier({newName: name, id: currentClassifier.id}));
        console.log("---------------------------------------------------")
        let message = "asdf"
        // const answer = await invoke<IpcMessage>("ipc_message", {message});
        // console.log(answer)
        let res = await invoke("greet", {message});
        console.log(res)
    }

    return (
        <div className="container">
            <h1>Welcome to Tauri!</h1>
            <Button color="primary" type="button" onClick={test}>Test</Button>

            <div className="row">
                <a href="https://vitejs.dev" target="_blank">
                    <img src="/vite.svg" className="logo vite" alt="Vite logo"/>
                </a>
                <a href="https://tauri.app" target="_blank">
                    <img src="/tauri.svg" className="logo tauri" alt="Tauri logo"/>
                </a>
                <a href="https://reactjs.org" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>

            <p>Click on the Tauri, Vite, and React logos to learn more.</p>

            <form
                className="row"
                onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                }}
            >
                <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter a name..."
                />
                <button type="submit">Greet</button>
            </form>

            <p>{greetMsg}</p>
        </div>
    );
}

export default App;
