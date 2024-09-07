import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Settings} from "lucide-react";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import * as React from "react";
/*

App settings
- DB location
- DB download
- Github Token
- Dark mode
- Project Link
- Buy me a Coffee
- Donate
*/


export const AppSettings = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="hidden h-8 lg:flex">
                    <Settings className="mr-2 h-4 w-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">App settings</h4>
                        <p className="text-sm text-muted-foreground">
                            Change editor settings below.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Width</Label>
                            <Input
                                id="width"
                                defaultValue="100%"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Max. width</Label>
                            <Input
                                id="maxWidth"
                                defaultValue="300px"
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Font</Label>
                            <div className="col-span-2">
                                <Select
                                    className="col-span-2"
                                    // defaultValue={editorFont}
                                    // onValueChange={(v) => setEditorFont(v)}
                                >
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Select"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fira Code">Fira Code</SelectItem>
                                        <SelectItem value="Roboto Mono">Roboto Mono</SelectItem>
                                        <SelectItem value="Source Code Pro">Source Code
                                            Pro</SelectItem>
                                        <SelectItem value="Space Mono">Space Mono</SelectItem>
                                        <SelectItem value="JetBrains Mono">JetBrains
                                            Mono</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="maxWidth">Size</Label>
                            <Input
                                id="maxWidth"
                                type="number"
                                // value={editorFontSize}
                                // onChange={(e) => setEditorFontSize(e.target.value)}
                                className="col-span-2 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="height">Theme</Label>
                            <div className="col-span-2">
                                <Select
                                    defaultValue="monokai"
                                    // onValueChange={(value) => setEditorTheme(value)}
                                >
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Select"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/*{Object.entries(monacoThemes).map(([themeId, themeName]) => (*/}
                                        {/*    <SelectItem key={themeId} value={themeId}>*/}
                                        {/*        {themeName}*/}
                                        {/*    </SelectItem>*/}
                                        {/*))}*/}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="vimMode">Vim mode</Label>
                            <Switch
                                // checked={editorVimMode}
                                // onCheckedChange={() => setEditorVimMode(!editorVimMode)}
                                id="vimMode"
                                aria-label="Toggle Vim mode"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}