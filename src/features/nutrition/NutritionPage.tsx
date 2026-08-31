import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { nutritionApi } from "./api";
import { SkeletonCard } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";

function currentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export function NutritionPage() {
  const [weekOf] = useState(currentWeekMonday());
  const queryClient = useQueryClient();

  const { data: items, isLoading, isError, error } = useQuery({
    queryKey: ["nutrition", "shopping-list", weekOf],
    queryFn: () => nutritionApi.getShoppingList(weekOf),
  });

  const markPurchased = useMutation({
    mutationFn: ({ id, price }: { id: string; price: number }) =>
      nutritionApi.markItemPurchased(id, price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nutrition", "shopping-list", weekOf] }),
  });

  if (isLoading) {
    return (
      <div className="page page--nutricao">
        <h1>Lista de Compras</h1>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  if (isError) return <div className="page-state page-state--error">{(error as Error).message}</div>;

  const totalEstimated = items?.reduce((sum, i) => sum + i.estimatedPrice, 0) ?? 0;
  const totalActual = items?.reduce((sum, i) => sum + (i.actualPrice ?? 0), 0) ?? 0;

  return (
    <div className="page page--nutricao">
      <h1>Lista de Compras — semana de {weekOf}</h1>

      <section className="card">
        <h2>Adicionar item</h2>
        <AddItemForm weekOf={weekOf} />
      </section>

      <section className="card">
        {!items || items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Nenhum item na lista"
            description="Adicione itens acima para começar a montar a lista desta semana."
          />
        ) : (
          <table className="exercise-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd.</th>
                <th>Estimado</th>
                <th>Real</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <ShoppingListRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  estimatedPrice={item.estimatedPrice}
                  actualPrice={item.actualPrice}
                  purchased={item.purchased}
                  onConfirm={(price) => markPurchased.mutate({ id: item.id, price })}
                  isSaving={markPurchased.isPending}
                />
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>R$ {totalEstimated.toFixed(2)}</strong></td>
                <td><strong>R$ {totalActual.toFixed(2)}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </section>
    </div>
  );
}

function ShoppingListRow({
  name, quantity, estimatedPrice, actualPrice, purchased, onConfirm, isSaving,
}: Readonly<{
  id: string;
  name: string;
  quantity: string;
  estimatedPrice: number;
  actualPrice?: number | null;
  purchased: boolean;
  onConfirm: (price: number) => void;
  isSaving: boolean;
}>) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(estimatedPrice.toString());

  return (
    <tr className={purchased ? "row-done" : ""}>
      <td>{name}</td>
      <td>{quantity}</td>
      <td>R$ {estimatedPrice.toFixed(2)}</td>
      <td>{actualPrice != null ? `R$ ${actualPrice.toFixed(2)}` : "-"}</td>
      <td>
        {!purchased && (
          editing ? (
            <div className="inline-edit">
              <input
                className="text-input"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  const parsed = Number.parseFloat(price);
                  if (!Number.isNaN(parsed)) onConfirm(parsed);
                }}
              >
                OK
              </button>
              <button type="button" className="button-secondary" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditing(true)}>Marcar comprado</button>
          )
        )}
      </td>
    </tr>
  );
}

function AddItemForm({ weekOf }: Readonly<{ weekOf: string }>) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");

  const addItem = useMutation({
    mutationFn: () =>
      nutritionApi.addShoppingListItem({
        name,
        quantity,
        estimatedPrice: Number.parseFloat(estimatedPrice),
        weekOf,
      }),
    onSuccess: () => {
      setName("");
      setQuantity("");
      setEstimatedPrice("");
      queryClient.invalidateQueries({ queryKey: ["nutrition", "shopping-list", weekOf] });
    },
  });

  return (
    <form
      className="inline-form"
      onSubmit={(e) => {
        e.preventDefault();
        addItem.mutate();
      }}
    >
      <div className="inline-form__fields">
        <label>
          <span>Nome</span>
          <input
            className="text-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <span>Quantidade</span>
          <input
            className="text-input"
            type="text"
            required
            placeholder="ex.: 1kg"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <label>
          <span>Preço estimado</span>
          <input
            className="text-input"
            type="number"
            step="0.01"
            min="0"
            required
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
          />
        </label>
      </div>
      {addItem.isError && (
        <p className="page-state page-state--error">{(addItem.error as Error).message}</p>
      )}
      <button type="submit" disabled={addItem.isPending}>
        {addItem.isPending ? "Adicionando..." : "Adicionar item"}
      </button>
    </form>
  );
}
