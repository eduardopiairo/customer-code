import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Edit / delete buttons. Larger tap targets on touch screens. */
export default function RowActions({ onEdit, onDelete, label, disabled }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-9 md:w-9"
          onClick={onEdit}
          title="Edit"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-destructive hover:text-destructive md:h-9 md:w-9"
        onClick={onDelete}
        disabled={disabled}
        title="Delete"
        aria-label={`Delete ${label}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
