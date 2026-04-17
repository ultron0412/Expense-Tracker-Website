import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: "",
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.items = action.payload;
    },
    addTransaction: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateTransaction: (state, action) => {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    removeTransaction: (state, action) => {
      state.items = state.items.filter((t) => t._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setLoading,
  setError,
} = transactionSlice.actions;

export default transactionSlice.reducer;

