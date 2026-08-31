import { apiClient } from "@/shared/api/client";
import type { MealPlanDto, ShoppingListItemDto } from "@/shared/api/types";

export const nutritionApi = {
  getMealPlan: async (mealPlanId: string): Promise<MealPlanDto> => {
    const { data } = await apiClient.get<MealPlanDto>(`/nutrition/meal-plans/${mealPlanId}`);
    return data;
  },

  getShoppingList: async (weekOf: string): Promise<ShoppingListItemDto[]> => {
    const { data } = await apiClient.get<ShoppingListItemDto[]>("/nutrition/shopping-list", {
      params: { weekOf },
    });
    return data;
  },

  markItemPurchased: async (itemId: string, actualPrice: number): Promise<void> => {
    await apiClient.patch(`/nutrition/shopping-list/${itemId}/purchase`, { actualPrice });
  },

  addShoppingListItem: async (payload: {
    name: string;
    quantity: string;
    estimatedPrice: number;
    weekOf: string;
  }): Promise<string> => {
    const { data } = await apiClient.post<string>("/nutrition/shopping-list", payload);
    return data;
  },
};
