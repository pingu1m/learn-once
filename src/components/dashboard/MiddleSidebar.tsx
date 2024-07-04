import { Button } from "../ui/button"
import { FolderTreeIcon } from "./icons";

export function MiddleSidebar() {
  return (
    <div className="border shadow-sm rounded-lg overflow-auto">
      <div
        className="flex items-center justify-between px-4 py-2 font-semibold border-b">
        <h2>All Notes</h2>
        <Button size="icon" variant="ghost">
          <FolderTreeIcon className="h-4 w-4" />
        </Button>
      </div>
      <ul className="divide-y">
        <li className="p-4">
          <div className="flex justify-between">
            <h3 className="font-medium">Note Title 1</h3>
            <small className="text-gray-500">Dec 4, 2023</small>
          </div>
        </li>
        <li className="p-4">
          <div className="flex justify-between">
            <h3 className="font-medium">Note Title 2</h3>
            <small>Dec 3, 2023</small>
          </div>
        </li>
        <li className="p-4">
          <div className="flex justify-between">
            <h3 className="font-medium">Note Title 3</h3>
            <small className="text-gray-500">Dec 2, 2023</small>
          </div>
        </li>
      </ul>
    </div>
  )
}