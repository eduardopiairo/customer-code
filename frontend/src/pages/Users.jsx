import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { listUsers, createUser, deleteUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import MobileList from "@/components/MobileList";
import RowActions from "@/components/RowActions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";

const EMPTY_FORM = { email: "", password: "", isAdmin: false };
const MIN_PASSWORD = 10;

export default function UsersPage({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function load() {
    setLoading(true);
    setListError("");
    try {
      setUsers(await listUsers());
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const patch = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  async function handleCreate(e) {
    e.preventDefault();
    setCreateError("");
    if (form.password.length < MIN_PASSWORD) {
      setCreateError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setCreateBusy(true);
    try {
      await createUser(form.email.trim(), form.password, form.isAdmin);
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      setDeleteTarget(null);
      setListError(err.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  const roleBadge = (u) => (u.is_admin ? <Badge>Admin</Badge> : "User");
  const isSelf = (u) => u.id === currentUserId;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            People who can sign in to this application.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => { setForm(EMPTY_FORM); setCreateError(""); setCreateOpen(true); }}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {listError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      )}

      <MobileList
        items={users}
        loading={loading}
        empty="No users."
        renderBody={(u) => (
          <>
            <p className="truncate font-medium">{u.email}</p>
            <p className="text-xs text-muted-foreground">
              {u.is_admin ? "Administrator" : "User"}
              {isSelf(u) ? " (you)" : ""}
            </p>
          </>
        )}
        actions={(u) => (
          <RowActions
            label={u.email}
            disabled={isSelf(u)}
            onDelete={() => setDeleteTarget(u)}
          />
        )}
      />

      <div className="hidden rounded-lg border bg-white shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><Badge>{u.id}</Badge></TableCell>
                  <TableCell className="font-medium">
                    {u.email}
                    {isSelf(u) && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{roleBadge(u)}</TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      label={u.email}
                      disabled={isSelf(u)}
                      onDelete={() => setDeleteTarget(u)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>
                Share the password with the person securely. They sign in with
                this e-mail and password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <div className="grid gap-1.5">
                <Label htmlFor="u-email">E-mail <span className="text-destructive">*</span></Label>
                <Input
                  id="u-email"
                  type="email"
                  autoComplete="off"
                  required
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="u-password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD}
                  value={form.password}
                  onChange={(e) => patch("password", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  At least {MIN_PASSWORD} characters.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.isAdmin}
                  onChange={(e) => patch("isAdmin", e.target.checked)}
                />
                Administrator (can manage users)
              </label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createBusy}>
                {createBusy ? "Saving…" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Delete <strong>{deleteTarget?.email}</strong>? They will no longer be able to sign in.
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
