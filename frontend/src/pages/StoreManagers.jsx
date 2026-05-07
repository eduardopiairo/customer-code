import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

import {
  listStoreManagers,
  createStoreManager,
  updateStoreManager,
  deleteStoreManager,
} from "@/api/storeManagers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";

const EMPTY_FORM = { name: "", email: "", phone: "" };

function ManagerForm({ values, onChange, error }) {
  return (
    <div className="grid gap-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="grid gap-1.5">
        <Label htmlFor="m-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="m-name"
          placeholder="Ana Silva"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="m-email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="m-email"
          type="email"
          placeholder="ana.silva@example.com"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="m-phone">Phone</Label>
        <Input
          id="m-phone"
          placeholder="+351 91 000 0000"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </div>
    </div>
  );
}

export default function StoreManagersPage() {
  const [managers, setManagers]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [listError, setListError]       = useState("");

  const [createOpen, setCreateOpen]     = useState(false);
  const [createForm, setCreateForm]     = useState(EMPTY_FORM);
  const [createError, setCreateError]   = useState("");
  const [createBusy, setCreateBusy]     = useState(false);

  const [editManager, setEditManager]   = useState(null);
  const [editForm, setEditForm]         = useState(EMPTY_FORM);
  const [editError, setEditError]       = useState("");
  const [editBusy, setEditBusy]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy]     = useState(false);

  async function load() {
    setLoading(true);
    setListError("");
    try {
      setManagers(await listStoreManagers());
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function patchCreate(field, value) {
    setCreateForm((f) => ({ ...f, [field]: value }));
  }

  function patchEdit(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate() {
    setCreateError("");
    if (!createForm.name.trim() || !createForm.email.trim()) {
      setCreateError("Name and email are required.");
      return;
    }
    setCreateBusy(true);
    try {
      await createStoreManager(createForm);
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateBusy(false);
    }
  }

  function openEdit(manager) {
    setEditManager(manager);
    setEditForm({
      name:  manager.name  ?? "",
      email: manager.email ?? "",
      phone: manager.phone ?? "",
    });
    setEditError("");
  }

  async function handleEdit() {
    setEditError("");
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError("Name and email are required.");
      return;
    }
    setEditBusy(true);
    try {
      await updateStoreManager(editManager.id, editForm);
      setEditManager(null);
      await load();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await deleteStoreManager(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Store Managers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the people responsible for each store.
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateForm(EMPTY_FORM);
            setCreateError("");
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Manager
        </Button>
      </div>

      {listError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      )}

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No managers yet. Click <strong>Add Manager</strong> to get started.
                </TableCell>
              </TableRow>
            ) : (
              managers.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><Badge>{m.id}</Badge></TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="text-muted-foreground">{m.phone ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(m)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(m)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Manager</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new store manager.
            </DialogDescription>
          </DialogHeader>
          <ManagerForm values={createForm} onChange={patchCreate} error={createError} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={createBusy}>
              {createBusy ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editManager}
        onOpenChange={(open) => { if (!open) setEditManager(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
            <DialogDescription>
              Update the details for <strong>{editManager?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <ManagerForm values={editForm} onChange={patchEdit} error={editError} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={editBusy}>
              {editBusy ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Manager</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              Stores assigned to this manager will become unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteBusy}>
              {deleteBusy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
