import { useSnippetStore } from "../store/SnippetStore";
import { readTextFile, removeFile } from "@tauri-apps/api/fs";
import { documentDir } from "@tauri-apps/api/path";
import { twMerge } from "tailwind-merge";
import { FiTrash } from "react-icons/fi";

interface Props {
  snippetName: string;
}

function SnippetItem({ snippetName }: Props) {
  const selectedSnippet = useSnippetStore((state) => state.selectedSnippet);
  const setSelectedSnipped = useSnippetStore((state) => state.setSelectedSnippet!);
  const removeSelectedSnippet = useSnippetStore((state) => state.removeSnippet);

  async function removeSnippet(snippetName: string) {
    const accepted = await new Promise((resolve) => {
      const response = window.confirm(
        `Are you sure you want to delete ${snippetName}?`
      );
      resolve(response);
    });

    if (!accepted) {
      return;
    }

    const getDir = await documentDir();
    await removeFile(`${getDir}/tauriDocs/${snippetName}`);
    removeSelectedSnippet(snippetName);
  }

  return (
    <div
      className={twMerge(
        "py-2 px-4 hover:bg-neutral-900 hover:cursor-pointer hover:shadow-xl hover:border hover:border-sky-500 hover:rounded-lg transition duration-300 ease-in-out",
        selectedSnippet?.name === snippetName
          ? "bg-sky-500 transition duration-300 ease-in-out rounded-lg shadow-xl"
          : ""
      )}
      onClick={async () => {
        setSelectedSnipped(null);

        const getDir = await documentDir();
        const snippetText = await readTextFile(
          `${getDir}/tauriDocs/${snippetName}`
        );
        
        setSelectedSnipped({ name: snippetName, code: snippetText });
      }}
    >
      <div className="flex">
        <h1 className="text-lg font-semibold">{snippetName}</h1>
        <FiTrash
          className="ml-auto text-sm hover:text-red-500 hover:cursor-pointer transition duration-300 ease-in-out"
          onClick={async () => await removeSnippet(snippetName)}
        />
      </div>
    </div>
  );
}

export default SnippetItem;
