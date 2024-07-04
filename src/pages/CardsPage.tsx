import {Editor} from "@monaco-editor/react";
import {Button} from "../components/ui/button.tsx";
import {FolderTreeIcon, SearchIcon} from "../components/dashboard/icons.tsx";
import {Input} from "../components/ui/input.tsx";
import {Badge} from "../components/ui/badge.tsx";

export default function CardsPage() {
    return (
        <>
            <div className="border shadow-sm rounded-lg overflow-auto">
                <div
                    className="flex items-center justify-between px-4 py-2 font-semibold border-b">
                    <h2>All Cards</h2>
                    <Button size="icon" variant="ghost">
                        <FolderTreeIcon className="h-4 w-4"/>
                    </Button>
                </div>
                <ul className="divide-y">
                    <li className="p-4">
                        <div className="flex justify-between">
                            <h3 className="font-medium">Card Title 1</h3>
                            <small className="text-gray-500">Dec 4, 2023</small>
                        </div>
                    </li>
                    <li className="p-4">
                        <div className="flex justify-between">
                            <h3 className="font-medium">Card Title 2</h3>
                            <small>Dec 3, 2023</small>
                        </div>
                    </li>
                    <li className="p-4">
                        <div className="flex justify-between">
                            <h3 className="font-medium">Card Title 3</h3>
                            <small className="text-gray-500">Dec 2, 2023</small>
                        </div>
                    </li>
                </ul>
            </div>
            <div>
                <div className="border shadow-sm rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 justify-start">
                        <SearchIcon className="h-5 w-5 text-gray-500"/>
                        <Input
                            className="w-full p-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800"
                            placeholder="Search notes..."
                            type="text"/>
                    </div>
                </div>
                <div className="border shadow-sm rounded-lg p-4">
                    <h2 className="font-semibold mb-2">Card Editor</h2>
                    {/* <textarea className="w-full h-60 p-2 rounded border border-gray-200 resize-none mb-4 dark:border-gray-800" /> */}

                    <Editor height="70vh" defaultLanguage="markdown" defaultValue="// some comment"/>
                    <div className="flex items-center justify-between">
                        <Button className="ml-auto">Save Card</Button>
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
        </>
    )
}
