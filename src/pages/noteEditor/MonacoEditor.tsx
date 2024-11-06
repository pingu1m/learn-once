import React, { useRef, useEffect } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { initVimMode } from 'monaco-vim';
import {EditorSettings} from "@/types.ts";

interface MonacoEditorProps {
    content: string;
    language: string;
    settings: EditorSettings;
    onChange: (value: string) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = React.memo(({
                                                                         content,
                                                                         language,
                                                                         settings,
                                                                         onChange,
                                                                     }) => {
    const editorRef = useRef(null);
    const monaco = useMonaco();
    const vimModeRef = useRef(null);

    useEffect(() => {
        if (!editorRef.current || !settings.vim_mode) return;

        const statusNode = document.querySelector('.status-node');
        if (statusNode) {
            vimModeRef.current = initVimMode(editorRef.current, statusNode);
        }

        return () => {
            if (vimModeRef.current) {
                vimModeRef.current.dispose();
            }
        };
    }, [settings.vim_mode]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        editor.addAction({
            id: 'save-note',
            label: 'Save Note',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            run: () => {
                const content = editor.getValue();
                onChange(content);
                return null;
            },
        });
    };

    return (
        <div className="flex flex-row flex-1">
            <Editor
                height="unset"
                language={language}
                value={content}
                onMount={handleEditorDidMount}
                onChange={onChange}
                wrapperProps={{
                    className: "flex-1 note-editor-wrapper overflow-hidden rounded-sm",
                }}
                options={{
                    cursorBlinking: "blink",
                    cursorStyle: "block-outline",
                    fontSize: settings.editor_font_size,
                    fontFamily: settings.editor_font,
                    fontLigatures: true,
                }}
            />
            <code className="status-node"></code>
        </div>
    );
});