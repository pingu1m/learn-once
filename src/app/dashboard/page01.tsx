import {AppSidebar} from "@/components/app-sidebar"
import {Separator} from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {NavActions} from "@/components/nav-actions.tsx";
import * as React from "react";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

export default function Page01() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <FileEditor/>
        </SidebarProvider>
    )
}

function FileEditor() {
    const [title, setTitle] = React.useState("Untitled")
    const [language, setLanguage] = React.useState("javascript")
    const [content, setContent] = React.useState("")

    return (
        <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b">
                <div className="flex flex-1 items-center gap-2 px-3">
                    <SidebarTrigger/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full sm:w-auto flex-grow"
                        placeholder="File title"
                    />
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select language"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="ml-auto px-3">
                    <NavActions/>
                </div>
            </header>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-col h-full">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-grow min-h-[300px]"
                        placeholder="Enter your code here..."
                    />
                </div>
            </div>
        </SidebarInset>
    )
}
