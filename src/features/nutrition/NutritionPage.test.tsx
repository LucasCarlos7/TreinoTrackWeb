import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NutritionPage } from "./NutritionPage";
import { nutritionApi } from "./api";
import { renderWithClient } from "@/test/test-utils";
import type { ShoppingListItemDto } from "@/shared/api/types";

vi.mock("./api", () => ({
  nutritionApi: {
    getShoppingList: vi.fn(),
    markItemPurchased: vi.fn(),
    addShoppingListItem: vi.fn(),
  },
}));

const items: ShoppingListItemDto[] = [
  {
    id: "item-1",
    name: "Frango",
    quantity: "2kg",
    estimatedPrice: 30,
    actualPrice: null,
    purchased: false,
    weekOf: "2026-08-24",
  },
];

beforeEach(() => {
  vi.mocked(nutritionApi.getShoppingList).mockResolvedValue(items);
  vi.mocked(nutritionApi.markItemPurchased).mockResolvedValue(undefined);
  vi.mocked(nutritionApi.addShoppingListItem).mockResolvedValue("item-2");
});

describe("NutritionPage", () => {
  it("renderiza a lista de compras", async () => {
    renderWithClient(<NutritionPage />);
    expect(await screen.findByText("Frango")).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há itens", async () => {
    vi.mocked(nutritionApi.getShoppingList).mockResolvedValueOnce([]);
    renderWithClient(<NutritionPage />);
    expect(await screen.findByText("Nenhum item na lista")).toBeInTheDocument();
  });

  it("marca um item como comprado via edição inline (sem window.prompt)", async () => {
    const user = userEvent.setup();
    renderWithClient(<NutritionPage />);

    await screen.findByText("Frango");
    await user.click(screen.getByRole("button", { name: "Marcar comprado" }));
    const priceInput = screen.getByDisplayValue("30");
    await user.clear(priceInput);
    await user.type(priceInput, "28.5");
    await user.click(screen.getByRole("button", { name: "OK" }));

    await waitFor(() =>
      expect(nutritionApi.markItemPurchased).toHaveBeenCalledWith("item-1", 28.5)
    );
  });

  it("adiciona um novo item à lista", async () => {
    const user = userEvent.setup();
    renderWithClient(<NutritionPage />);

    await screen.findByText("Frango");
    await user.type(screen.getByLabelText("Nome"), "Arroz");
    await user.type(screen.getByLabelText("Quantidade"), "1kg");
    await user.type(screen.getByLabelText("Preço estimado"), "10");
    await user.click(screen.getByRole("button", { name: "Adicionar item" }));

    await waitFor(() =>
      expect(nutritionApi.addShoppingListItem).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Arroz", quantity: "1kg", estimatedPrice: 10 })
      )
    );
  });
});
