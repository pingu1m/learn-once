import React, {useState} from "react";
import {documentDir} from "@tauri-apps/api/path";
import {exists, writeFile} from "@tauri-apps/api/fs";
import {toast} from "react-hot-toast";

function SnippetForm() {
  const [snippetName, setSnippetName] = useState<string>();

  async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createSnippet()
      .then(result => {
        toast.success(result!.toString());
      })
      .catch(error => {
        toast.error(error);
      });
  }

  function createSnippet() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!snippetName) {
          reject("Snippet name is required");
        }

        if (snippetName!.length > 255) {
          reject("Snippet name is too long");
        }

        if (await existsFile()) {
          reject("Snippet already exists");
        }

        await createFile();
        resolve("Snippet created successfully");
      } catch (e) {
        reject(e);
      }
    });
  }

  async function createFile() {
    let path = await documentDir();
    await writeFile(`${path}/tauriDocs/${snippetName}`, "");
  }

  async function existsFile() {
    let path = await documentDir();
    return await exists(`${path}/tauriDocs/${snippetName}`);
  }

  return (
    <form onSubmit={(e) => submitHandler(e)}>
      <input
        className="bg-zinc-900 w-full border-none outline-none p-4 text-white"
        type="text"
        placeholder="Snippet Name"
        onChange={(e) => setSnippetName(e.target.value)}
      />
      <button
        className="hidden"
        type="submit"
      />
    </form>
  );
}

export default SnippetForm;
