export function SkeletonLine({ width = "100%" }: Readonly<{ width?: string }>) {
  return <div className="skeleton-line" style={{ width }} />;
}

export function SkeletonCard({ lines = 3 }: Readonly<{ lines?: number }>) {
  return (
    <div className="card skeleton-card">
      <SkeletonLine width="50%" />
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} width={`${90 - i * 10}%`} />
      ))}
    </div>
  );
}
