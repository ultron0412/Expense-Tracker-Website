import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "../features/transactions/transactionSlice";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
});

