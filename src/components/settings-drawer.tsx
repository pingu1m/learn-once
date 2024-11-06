import { Button } from "@/components/ui/button.tsx";
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer.tsx";
import useSettingsStore from "@/store/useSettingsStore.ts";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "react-toastify";
import monacoThemes from "monaco-themes/themes/themelist";

function ExportDatabaseButton() {
  const handleExport = async () => {
    try {
      const result = await invoke("export_database");
      console.log(result); // "Database exported successfully"
      // Show success message
    } catch (error) {
      console.error("Failed to export database:", error);
      // Show error message
    }
  };

  return <button onClick={handleExport}>Export Database</button>;
}

export function SettingsDrawer() {
  const {
    settings: globalSettings,
    loadSettings,
    saveSettings,
  } = useSettingsStore();
  const [loading, setLoading] = useState(false);

  // Local state to handle the unsaved settings changes
  const [localSettings, setLocalSettings] = useState(globalSettings);

  const handleTestGistToken = async () => {
    setLoading(true);
    try {
      const result = await invoke("test_gist_token");
      toast.success("Github token valid. " + result);
    } catch (error) {
      toast.error("Github token not valid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings(); // Load settings from store when component mounts
  }, [loadSettings]);

  useEffect(() => {
    // Sync local state whenever global settings change
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  const handleChange = <T extends keyof typeof localSettings>(
    key: T,
    value: (typeof localSettings)[T],
  ) => {
    setLocalSettings({
      ...localSettings,
      [key]: value,
    });
  };

  const handleSave = () => {
    saveSettings(localSettings); // Save local settings to global store
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="lg:flex w-full justify-start bg-background hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 border-muted-foreground/20"
        >
          <Settings className="mr-2 h-4 w-4" />
          App Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>App Settings</DrawerTitle>
            <DrawerDescription>
              Configure the app to your liking.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid  grid-cols-subgrid gap-2">
                {/* <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="dbLocation">DB location path</Label>
                  <Input
                    id="dbLocation"
                    value={localSettings.db_location}
                    onChange={(e) =>
                      handleChange("db_location", e.target.value)
                    }
                    className="col-span-2 h-8"
                  />
                </div> */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="githubGistToken">GitHub Gist Token</Label>
                  <Input
                    id="githubGistToken"
                    value={localSettings.github_gist_token}
                    onChange={(e) =>
                      handleChange("github_gist_token", e.target.value)
                    }
                    className="col-span-2 h-8"
                  />
                  <Button
                    variant="default"
                    onClick={handleTestGistToken}
                    disabled={globalSettings.github_gist_token == ""}
                  >
                    {loading ? "..." : "Test Gist Token"}
                  </Button>
                </div>
              </div>
              <div className="grid  grid-cols-subgrid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="editorFont">Editor: Font</Label>
                  <Select
                    value={localSettings.editor_font}
                    onValueChange={(value) =>
                      handleChange("editor_font", value)
                    }
                  >
                    <SelectTrigger id="editorFont">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fira Code">Fira Code</SelectItem>
                      <SelectItem value="Roboto Mono">Roboto Mono</SelectItem>
                      <SelectItem value="Source Code Pro">
                        Source Code Pro
                      </SelectItem>
                      <SelectItem value="Space Mono">Space Mono</SelectItem>
                      <SelectItem value="JetBrains Mono">
                        JetBrains Mono
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="editorFontSize">Editor: Font Size</Label>
                  <Input
                    id="editorFontSize"
                    type="number"
                    value={localSettings.editor_font_size}
                    onChange={(e) =>
                      handleChange("editor_font_size", Number(e.target.value))
                    }
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="editorTheme">Editor: Theme</Label>

                  <Select
                    defaultValue="monokai"
                    value={localSettings.editor_theme}
                    onValueChange={(value) =>
                      handleChange("editor_theme", value)
                    }
                  >
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(monacoThemes).map(
                        ([themeId, themeName]) => (
                          <SelectItem key={themeId} value={themeId}>
                            {themeName}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="vimMode">Editor: Vim Mode</Label>
                  <Switch
                    checked={localSettings.vim_mode}
                    onCheckedChange={(checked) =>
                      handleChange("vim_mode", checked)
                    }
                    id="vimMode"
                    aria-label="Toggle Vim Mode"
                  />
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSave}>Save Settings</Button>
            <ExportDatabaseButton />
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
