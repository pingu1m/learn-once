import { useState, useCallback } from 'react';
import { Item } from '../types';

export const useSearchManager = (items: Item[]) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useCallback(() => {
        return items.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
    };
};