// store.ts
import create from 'zustand';
import { Card } from './cardModel';

interface CardState {
    selectedCard: Card | null;
    setSelectedCard: (card: Card | null) => void;
    resetSelectedCard: () => void;
}

const useCardStore = create<CardState>((set) => ({
    selectedCard: null,
    setSelectedCard: (card) => set({ selectedCard: card }),
    resetSelectedCard: () => set({ selectedCard: null }),
}));

export default useCardStore;
