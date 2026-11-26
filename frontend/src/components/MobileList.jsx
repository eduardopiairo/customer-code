import { Badge } from "@/components/ui/badge";

/** Card list shown instead of a table below the md breakpoint. */
export default function MobileList({ items, loading, empty, renderBody, actions }) {
  if (loading || items.length === 0) {
    return (
      <p className="rounded-lg border bg-white px-4 py-10 text-center text-sm text-muted-foreground shadow-sm md:hidden">
        {loading ? "Loading…" : empty}
      </p>
    );
  }
  return (
    <ul className="space-y-3 md:hidden">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">{renderBody(item)}</div>
            <Badge>{item.id}</Badge>
          </div>
          <div className="mt-2 border-t pt-2">{actions(item)}</div>
        </li>
      ))}
    </ul>
  );
}
