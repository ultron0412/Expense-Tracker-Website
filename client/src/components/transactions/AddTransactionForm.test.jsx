import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTransactionForm from "./AddTransactionForm";

describe("AddTransactionForm", () => {
  test("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onClose = vi.fn();

    render(<AddTransactionForm open onCreate={onCreate} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /save transaction/i }));

    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("submits normalized payload and closes modal", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const { container } = render(<AddTransactionForm open onCreate={onCreate} onClose={onClose} />);

    await user.type(screen.getByPlaceholderText("e.g., Groceries, Rent, Salary"), "  Groceries  ");
    await user.type(screen.getByPlaceholderText("0.00"), "125.5");
    const typeSelect = container.querySelector("select[name='type']");
    const categorySelect = container.querySelector("select[name='category']");
    const dateInput = container.querySelector("input[name='date']");
    expect(typeSelect).not.toBeNull();
    expect(categorySelect).not.toBeNull();
    expect(dateInput).not.toBeNull();

    await user.selectOptions(typeSelect, "income");
    await user.selectOptions(categorySelect, "Rent");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-04-13");
    await user.click(screen.getByRole("button", { name: /save transaction/i }));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Groceries",
        amount: 125.5,
        type: "income",
        category: "Rent",
        date: "2026-04-13",
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
