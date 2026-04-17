import { API_BASE_URL } from "../../config/env";

const API_BASE = `${API_BASE_URL}/transactions`;

async function handleJson(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || fallbackMessage);
  return data;
}

export async function fetchTransactions(token) {
  const response = await fetch(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleJson(response, "Failed to fetch transactions");
}

export async function createTransaction(token, payload) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleJson(response, "Failed to create transaction");
}

export async function updateTransaction(token, id, payload) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return handleJson(response, "Failed to update transaction");
}

export async function deleteTransaction(token, id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson(response, "Failed to delete transaction");
}
