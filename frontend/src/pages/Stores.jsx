import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

import { listStores, createStore, updateStore, deleteStore } from "@/api/stores";
import { listStoreManagers } from "@/api/storeManagers";
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

const EMPTY_FORM = { name: "", address: "", phone: "", email: "", manager_id: "" };

function StoreForm({ values, onChange, managers, error }) {
  return (
    <div className="grid gap-4">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <div className="grid gap-1.5">
        <Label htmlFor="f-name">Name <span className="text-destructive">*</span></Label>
        <Input
          id="f-name"
          placeholder="Farmácia Central"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-address">Address <span className="text-destructive">*</span></Label>
        <Input
          id="f-address"
          placeholder="Rua das Flores 42, Lisboa"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-phone">Phone</Label>
        <Input
          id="f-phone"
          placeholder="+351 21 000 0000"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-email">Email</Label>
        <Input
          id="f-email"
          type="email"
          placeholder="store@example.com"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-manager">Manager</Label>
        <select
          id="f-manager"
          value={values.manager_id}
          onChange={(e) => onChange("manager_id", e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">— No manager —</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function StoresPage() {
  const [stores, setStores]           = useState([]);
  const [managers, setManagers]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [listError, setListError]     = useState("");

  const [createOpen, setCreateOpen]   = useState(false);
  const [createForm, setCreateForm]   = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [createBusy, setCreateBusy]   = useState(false);

  const [editStore, setEditStore]     = useState(null);
  const [editForm, setEditForm]       = useState(EMPTY_FORM);
  const [editError, setEditError]     = useState("");
  const [editBusy, setEditBusy]       = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy]     = useState(false);

  async function load() {
    setLoading(true);
    setListError("");
    try {
      const [storesData, managersData] = await Promise.all([
        listStores(),
        listStoreManagers(),
      ]);
      setStores(storesData);
      setManagers(managersData);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function managerName(manager_id) {
    const m = managers.find((m) => m.id === manager_id);
    return m ? m.name : "—";
  }

  function patchCreate(field, value) {
    setCreateForm((f) => ({ ...f, [field]: value }));
  }

  function patchEdit(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate() {
    setCreateError("");
    if (!createForm.name.trim() || !createForm.address.trim()) {
      setCreateError("Name and address are required.");
      return;
    }
    setCreateBusy(true);
    try {
      await createStore({
        ...createForm,
        manager_id: createForm.manager_id ? Number(createForm.manager_id) : null,
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateBusy(false);
    }
  }

  function openEdit(store) {
    setEditStore(store);
    setEditForm({
      name:       store.name       ?? "",
      address:    store.address    ?? "",
      phone:      store.phone      ?? "",
      email:      store.email      ?? "",
      manager_id: store.manager_id ?? "",
    });
    setEditError("");
  }

  async function handleEdit() {
    setEditError("");
    if (!editForm.name.trim() || !editForm.address.trim()) {
      setEditError("Name and address are required.");
      return;
    }
    setEditBusy(true);
    try {
      await updateStore(editStore.id, {
        ...editForm,
        manager_id: editForm.manager_id ? Number(editForm.manager_id) : null,
      });
      setEditStore(null);
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
      await deleteStore(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setListError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Stores</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your network of stores.
            </p>
          </div>
          <Button onClick={() => { setCreateForm(EMPTY_FORM); setCreateError(""); setCreateOpen(true); }}>
            <Plus className="h-4 w-4" />
            Add Store
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
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No stores yet. Click <strong>Add Store</strong> to get started.
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge>{s.id}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.address}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{managerName(s.manager_id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
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
      </main>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Store</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new store or pharmacy.
            </DialogDescription>
          </DialogHeader>
          <StoreForm values={createForm} onChange={patchCreate} managers={managers} error={createError} />
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
      <Dialog open={!!editStore} onOpenChange={(open) => { if (!open) setEditStore(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update the details for <strong>{editStore?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <StoreForm values={editForm} onChange={patchEdit} managers={managers} error={editError} />
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
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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
    </>
  );
}
