import Editor from "@monaco-editor/react";
import { useSnippetStore } from "../store/SnippetStore";
import { writeTextFile } from "@tauri-apps/api/fs";
import { documentDir } from "@tauri-apps/api/path";
import { toast } from "react-hot-toast";
import { TfiPencil } from "react-icons/all";

function handleDocumentLanguage(snippetName: string) {
  const languageMap: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    cs: "csharp",
    go: "go",
    rs: "rust",
    c: "c",
    cpp: "cpp",
    java: "java",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    toml: "toml",
    sql: "sql",
    sh: "shell",
    bat: "bat",
    ps1: "powershell",
    rb: "ruby",
    lua: "lua",
    dart: "dart",
    kt: "kotlin",
    swift: "swift",
    r: "r",
    scala: "scala",
    vb: "vb",
    h: "c",
    hpp: "cpp",
    csproj: "xml",
    sln: "xml",
  };

  const extension = snippetName.split(".").pop()!.toLowerCase();
  return languageMap[extension] || "plaintext";
}

async function handleSaveFile(filename: string, code: string) {
  const documentPath = await documentDir();

  await writeTextFile(
    `${documentPath}/tauriDocs/${filename}`,
    code
  );

  toast.success("Saved file!", {
    duration: 2000,
    position: "bottom-right",
    style: {
      background: "#333",
      color: "#fff",
    },
  });
}

function SnippetEditor() {
  const { selectedSnippet } = useSnippetStore((state) => state);

  return (
    <>
      {selectedSnippet ? (
        <Editor
          theme="vs-dark"
          options={{
            fontSize: 16,
            mouseWheelZoom: true,
          }}
          defaultValue="Empty file or loading..."
          value={selectedSnippet.code ?? ""}
          language={handleDocumentLanguage(selectedSnippet.name)}
          onMount={(editor) => {
            editor.onKeyDown(async (e) => {
              // Ctrl + S save the file
              if (e.ctrlKey && e.code === "KeyS") {
                e.preventDefault();
                await handleSaveFile(selectedSnippet.name, editor.getValue());
              }

              // Ctrl + Z undo
              if (e.ctrlKey && e.code === "KeyZ") {
                e.preventDefault();
                console.log("Undoing...");
                editor.trigger("anyString", "undo", "");
              }

              // Ctrl + Y redo
              if (e.ctrlKey && e.code === "KeyY") {
                e.preventDefault();
                console.log("Redoing...");
                editor.trigger("anyString", "redo", "");
              }

              // Ctrl + F find
              if (e.ctrlKey && e.code === "KeyF") {
                e.preventDefault();
                console.log("Finding...");
                editor.trigger("anyString", "actions.find", "");
              }

              // Ctrl + A select all
              if (e.ctrlKey && e.code === "KeyA") {
                e.preventDefault();
                console.log("Selecting all...");
                editor.trigger("anyString", "editor.action.selectAll", "");
              }

              // Ctrl + w close tab
              if (e.ctrlKey && e.code === "KeyW") {
                e.preventDefault();
                console.log("Closing tab...");
                editor.dispose();
              }
            });
          }}
        ></Editor>
      ) : (
        <div className="flex justify-center items-center h-full">
          <TfiPencil className="text-9xl text-neutral-500" />
        </div>
      )}
    </>
  );
}

export default SnippetEditor;
