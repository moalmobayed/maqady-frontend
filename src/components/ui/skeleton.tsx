type SkeletonProps = {
  className?: string;
  label?: string;
};

export function Skeleton({
  className = "h-4 w-full",
  label = "Loading",
}: SkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="block h-full w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none"
      />
    </div>
  );
}
