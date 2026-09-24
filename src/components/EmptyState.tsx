import type { ComponentType } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-12 text-center">
      <Icon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
      <p className="text-zinc-300">{title}</p>
      {hint && <p className="text-sm text-zinc-500 mt-1">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
