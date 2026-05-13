import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slices/dataSlice';

const store = configureStore({
  reducer: {
    data: dataReducer
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: false
  //   })
});

export default store;
