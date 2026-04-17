import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionList from "./TransactionList";

const transactions = [
  {
    _id: "tx-1",
    title: "Lunch",
    amount: 20,
    type: "expense",
    category: "Food",
    date: "2026-04-12T10:00:00.000Z",
  },
  {
    _id: "tx-2",
    title: "Salary",
    amount: 2000,
    type: "income",
    category: "Salary",
    date: "2026-04-13T10:00:00.000Z",
  },
  {
    _id: "tx-3",
    title: "Rent April",
    amount: 800,
    type: "expense",
    category: "Rent",
    date: "2026-04-10T10:00:00.000Z",
  },
];

describe("TransactionList", () => {
  test("renders empty state when there are no items", () => {
    render(<TransactionList transactions={[]} />);
    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });

  test("filters transactions by selected category", async () => {
    const user = userEvent.setup();
    render(<TransactionList transactions={transactions} />);

    const selects = screen.getAllByRole("combobox");
    const categorySelect = selects[1];
    await user.selectOptions(categorySelect, "Rent");

    expect(screen.getByText("Rent April")).toBeInTheDocument();
    expect(screen.queryByText("Lunch", { selector: "p" })).not.toBeInTheDocument();
    expect(screen.queryByText("Salary", { selector: "p" })).not.toBeInTheDocument();
  });

  test("calls delete callback for a transaction", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<TransactionList transactions={transactions} onDelete={onDelete} />);

    const item = screen.getByText("Lunch").closest("article");
    const deleteBtn = item.querySelector("button:last-of-type");
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith("tx-1");
  });
});
