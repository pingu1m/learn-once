import React from 'react';
import {Link} from 'react-router-dom';
import {PlusIcon, FolderIcon, StarIcon, TrashIcon} from "./icons";
import {Button} from "../ui/button";

export function LeftSidebar() {
    return (
        <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
                <Button
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                    <PlusIcon className="h-4 w-4"/>
                    New Note
                </Button>
                <Link
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    to="/notes">
                    <FolderIcon className="h-4 w-4"/>
                    Notes
                </Link>
                <Link
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    to="/cards">
                    <FolderIcon className="h-4 w-4"/> {/* Assuming you have a suitable icon for "Cards" */}
                    Cards
                </Link>
                <Link
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    to="/ref">
                    <FolderIcon className="h-4 w-4"/> {/* Assuming you have a suitable icon for "Cards" */}
                    Ref
                </Link>
                <Link
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    to="#">
                    <StarIcon className="h-4 w-4"/>
                    Favourites
                </Link>
                <Link
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    to="#">
                    <TrashIcon className="h-4 w-4"/>
                    Trash
                </Link>
            </nav>
        </div>
    );
}