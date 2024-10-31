import create from 'zustand';
import {persist} from 'zustand/middleware';
import {invoke} from "@tauri-apps/api/core";

interface Settings {
    id: number;
    db_location: string;
    github_gist_token: string;
    dark_mode: boolean;
    editor_font: string;
    editor_font_size: number;
    editor_theme: string;
    vim_mode: boolean;
}

interface SettingsStore {
    settings: Settings;
    loadSettings: () => Promise<void>;
    saveSettings: (newSettings: Settings) => Promise<void>;
    // updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}
const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            settings: {
                id: 1,
                db_location: '',
                github_gist_token: '',
                dark_mode: false,
                editor_font: 'Fira Code',
                editor_font_size: 14,
                editor_theme: 'monokai',
                vim_mode: false,
            },

            // Action to load settings from Tauri backend
            loadSettings: async () => {
                try {
                    const fetchedSettings: Settings = await invoke('get_settings');
                    set({settings: fetchedSettings});
                } catch (error) {
                    console.error('Zustand Failed to load settings:', error);
                }
            },

            // Action to save settings to Tauri backend
            saveSettings: async (newSettings: Settings) => {
                try {
                    await invoke('save_settings', {settings: newSettings});
                    set({settings: newSettings});
                } catch (error) {
                    console.error('Zustand Failed to save settings:', error);
                }
            },
        }),
        {
            name: 'settings-storage', // Unique name for persistence
        }
    )
);

export default useSettingsStore;
