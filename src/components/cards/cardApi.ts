// cardApi.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Card} from './cardModel';
import {invoke} from "@tauri-apps/api/core";

// Fetch all cards using the card_select command
const fetchCards = async (): Promise<Card[]> => {
    const response = await invoke<string>('card_select');
    return JSON.parse(response);
};

// Create a new card using the card_insert command
const createCard = async (card: Omit<Card, 'id'>): Promise<Card> => {
    const id = await invoke<number>('card_insert', {card});
    return {...card, id};
};

// Update an existing card using the card_update command
const updateCard = async (card: Card): Promise<Card> => {
    await invoke<number>('card_update', {card});
    return card;
};

// Delete a card using the card_delete command
const deleteCard = async (cardId: number): Promise<void> => {
    await invoke<number>('card_delete', {id: cardId});
};

export const useCards = () => {
    return useQuery<Card[], Error>(["cards"], fetchCards);
};

export const useCreateCard = () => {
    const queryClient = useQueryClient();
    return useMutation(createCard, {
        onSuccess: () => {
            queryClient.invalidateQueries(["cards"]);
        },
    });
};

export const useUpdateCard = () => {
    const queryClient = useQueryClient();
    return useMutation(updateCard, {
        onSuccess: () => {
            queryClient.invalidateQueries(['cards']);
        },
    });
};

export const useDeleteCard = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteCard, {
        onSuccess: () => {
            queryClient.invalidateQueries(['cards']);
        },
    });
};
