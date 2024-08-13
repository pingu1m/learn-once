import { useEffect } from "react";
import { BaseDirectory, readDir } from "@tauri-apps/api/fs";
import { useSnippetStore } from "../store/SnippetStore";
import SnippetItem from "./SnippetItem";

function SnippetList() {
  const setSnippetName = useSnippetStore((state) => state.setSnippetName);
  const snippetNames = useSnippetStore((state) => state.snippetName);

  useEffect(() => {
    const interval = setInterval(() => {
      getSnippetFiles().then((files) => {
        setSnippetName(files);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function getSnippetFiles() {
    let files = await readDir(`tauriDocs`, {
      dir: BaseDirectory.Document,
    });

    return files
      .map((file) => file.name!)
      .filter((file) => file !== "tauriDocs");
  }

  return (
    <div>
      <h1 className="text-center text-xl font-bold">FILES</h1>
      {snippetNames.map((name) => (
        <SnippetItem key={name} snippetName={name} /> // Se le pasa el nombre del archivo.
      ))}
    </div>
  );
}

export default SnippetList;
