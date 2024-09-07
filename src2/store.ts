import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { classifierReducer } from './edit-name.redux';
import { appReducer } from './app.redux';

export const store = configureStore({
    reducer: {
        classifier: classifierReducer,
        application: appReducer
    }
  });

export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;