import * as React from "react"
import {File, Folder, BookOpen, Search, GitBranch, Trash2, Star, Save, BookOpenCheck} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import {Button} from "@/components/ui/button.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

// This is sample data with a flat file structure
const data = {
  changes: [
    { file: "README.md", state: "M" },
    { file: "api/hello/route.ts", state: "U" },
    { file: "app/layout.tsx", state: "M" },
  ],
  files: [
    { name: "app/page.tsx", gistSynced: true },
    { name: "app/layout.tsx", gistSynced: false },
    { name: "app/globals.css", gistSynced: false },
    { name: "app/api/hello/route.ts", gistSynced: true },
    { name: "components/ui/button.tsx", gistSynced: false },
    { name: "components/ui/card.tsx", gistSynced: false },
    { name: "components/header.tsx", gistSynced: true },
    { name: "components/footer.tsx", gistSynced: false },
    { name: "lib/utils.ts", gistSynced: true },
    { name: "public/favicon.ico", gistSynced: false },
    { name: "public/vercel.svg", gistSynced: false },
    { name: ".eslintrc.json", gistSynced: false },
    { name: ".gitignore", gistSynced: false },
    { name: "next.config.js", gistSynced: false },
    { name: "tailwind.config.js", gistSynced: false },
    { name: "package.json", gistSynced: false },
    { name: "README.md", gistSynced: true },
  ],
  studySessions: [
    "Mathematics/Algebra",
    "Mathematics/Calculus/Differential Equations",
    "Mathematics/Calculus/Integrals",
    "Science/Physics",
    "Science/Chemistry/Organic",
    "Science/Chemistry/Inorganic",
    "Literature/Poetry",
    "Literature/Prose/Novel",
    "Literature/Prose/Short Story",
  ],
}

export default function Page13() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">ui</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>button.tsx</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col p-4">
          <FileEditor />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredFiles = data.files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Sidebar {...props}>
      <div className="flex flex-col h-full">
        <SidebarContent className="flex-grow">
          <SidebarGroup>
            {/*<SidebarGroupLabel>Files</SidebarGroupLabel>*/}
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <SidebarMenu>
                {filteredFiles.map((file, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton className="w-full flex items-center justify-between">
                      <span className="flex items-center">
                        <File className="mr-2 h-4 w-4" />
                        {file.name}
                      </span>
                      {file.gistSynced && (
                        <GitBranch className="h-4 w-4 text-muted-foreground" aria-label="Gist synced" />
                      )}
                    </SidebarMenuButton>
                    {/*<SidebarMenuBadge>M</SidebarMenuBadge>*/}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <File className="mr-2 h-4 w-4" />
                New Files
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpen className="mr-2 h-4 w-4" />
                New Study Sessions
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
      <SidebarRail />
    </Sidebar>
  )
}

function FileEditor() {
  const [title, setTitle] = React.useState("Untitled")
  const [language, setLanguage] = React.useState("javascript")
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [isGistSync, setIsGistSync] = React.useState(false)
  const [isAutoSave, setIsAutoSave] = React.useState(true)
  const [content, setContent] = React.useState("")

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full sm:w-auto flex-grow"
          placeholder="File title"
        />
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="icon"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Star className="h-4 w-4" />
          <span className="sr-only">Favorite</span>
        </Button>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            id="gist-sync"
            checked={isGistSync}
            onCheckedChange={setIsGistSync}
          />
          <label htmlFor="gist-sync" className="text-sm font-medium">
            <GitBranch className="h-4 w-4 inline-block mr-1" />
            Gist Sync
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-save"
            checked={isAutoSave}
            onCheckedChange={setIsAutoSave}
          />
          <label htmlFor="auto-save" className="text-sm font-medium">
            <Save className="h-4 w-4 inline-block mr-1" />
            Auto Save
          </label>
        </div>
        <Button>
          <BookOpenCheck className="h-4 w-4 mr-2" />
          Study this file
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-grow min-h-[300px]"
        placeholder="Enter your code here..."
      />
    </div>
  )
}