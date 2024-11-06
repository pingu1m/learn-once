import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SaveButtonProps {
    onSave: () => void;
    hasUnsavedChanges: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onSave, hasUnsavedChanges }) => {
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
        setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (hasUnsavedChanges && onSave) {
                    onSave();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onSave, hasUnsavedChanges, isMac]);

    const shortcutText = isMac ? '⌘ S' : 'Ctrl + S';

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            className="relative group"
            aria-label={hasUnsavedChanges ? "Save changes" : "No unsaved changes"}
        >
            <Save className="h-4 w-4 mr-1"/>
            Save
            {hasUnsavedChanges && <span className="ml-1 text-yellow-500">*</span>}
            <span className="ml-2 text-xs text-muted-foreground">
                {shortcutText}
            </span>
        </Button>
    );
};