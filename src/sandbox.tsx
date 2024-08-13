import {Button} from "@/components/ui/button.tsx";
import {useEffect} from "react";
import { invoke } from "@tauri-apps/api/core";

type IpcMessage = {
    domain: string,
    action: { type: string, payload: any }
}

function Sandbox() {
    // const dispatch = useDispatch();

    async function sendMessage<T>(action: { type: string, payload: T }) {
        const actionIdentifiers = action.type.split("/");
        const domain = actionIdentifiers[0]
        const type = actionIdentifiers[1];
        const message: IpcMessage = {
            domain,
            action: {...action, type}
        };
        const answer = await invoke<IpcMessage>("ipc_message", {message});
        console.log(answer)
        // const responseAction = {
        //     ...answer.action,
        //     type: `${answer.domain}/${answer.action.type}`
        // };
        // dispatch(responseAction);
    }

    async function test() {
        // await sendMessage(renameClassifier({newName: name, id: currentClassifier.id}));
        console.log("---------------------------------------------------")
        let message = "asdf"
        // const answer = await invoke<IpcMessage>("ipc_message", {message});
        // console.log(answer)
        let res = await invoke("greet", { message });
        console.log(res)
    }

    useEffect(() => {
        const sendApplicationReady = async () => {
            // await sendMessage(applicationReady());
        }
        sendApplicationReady();
    }, []);
    return (
        <div style={{
            width: "90%",
            margin: "auto",
            marginTop: "50px",
        }}>
            Test
            <br/>
            <Button color="primary" type="button" onClick={test}>Test</Button>
            <hr/>
            <div className="container">
                {/*{currentClassifier && <div>*/}
                {/*    <input*/}
                {/*        id="greet-input"*/}
                {/*        value={name}*/}
                {/*        onChange={(e) => dispatch(renamingClassifier({*/}
                {/*            newName: e.target.value,*/}
                {/*            id: currentClassifier.id*/}
                {/*        }))}*/}
                {/*        placeholder="Enter a name..."*/}
                {/*    />*/}
                {/*    <button type="button" onClick={async () => {*/}
                {/*        await sendMessage(renameClassifier({newName: name, id: currentClassifier.id}));*/}
                {/*    }}>*/}
                {/*        Edit*/}
                {/*    </button>*/}
                {/*    <button type="button" onClick={async () => {*/}
                {/*        await sendMessage(cancelClassifierRename());*/}
                {/*    }}>*/}
                {/*        Cancel*/}
                {/*    </button>*/}
                {/*</div>}*/}
                {/*{editState !== 'none' &&*/}
                {/*    <p className={editState === 'successful' ? 'change-successful' : 'change-canceled'}>*/}
                {/*        {editState === 'successful' ? 'Name was changed' : 'Editing was canceled.'}*/}
                {/*    </p>}*/}
            </div>
        </div>
    )
}

export default Sandbox;