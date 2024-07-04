import { SearchIcon } from "./icons";
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Editor } from "@monaco-editor/react";

export function Notes() {
  return (
    <div>
      <div className="border shadow-sm rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 justify-start">
          <SearchIcon className="h-5 w-5 text-gray-500" />
          <Input
            className="w-full p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800"
            placeholder="Search notes..."
            type="text" />
        </div>
      </div>
      <div className="border shadow-sm rounded-lg p-4">
        <h2 className="font-semibold mb-2">Note Editor</h2>
        {/* <textarea className="w-full h-60 p-2 rounded border border-gray-200 resize-none mb-4 dark:border-gray-800" /> */}

        <Editor height="70vh" defaultLanguage="markdown" defaultValue="// some comment" />
        <div className="flex items-center justify-between">
          <Button className="ml-auto">Save Note</Button>
          <div className="ml-4">
            <p className="font-semibold mb-2">Recommended Tags</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                variant="secondary">
                work
              </Badge>
              <Badge
                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                variant="secondary">
                personal
              </Badge>
              <Badge
                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                variant="secondary">
                todo
              </Badge>
              <Badge
                className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                variant="secondary">
                idea
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}