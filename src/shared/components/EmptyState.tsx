export function EmptyState({
  icon = "📭", title, description,
}: Readonly<{ icon?: string; title: string; description?: string }>) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  );
}
