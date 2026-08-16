import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSettingsContext } from "../../providers/SettingsProvider";
import {
  deleteAccountSchema,
  type DeleteAccountFormValues,
} from "../../lib/settings/settings-export";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { SectionPanel } from "../shared/SectionPanel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function DangerZonePanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    isDeleteBusy,
    deleteError,
    submitDeleteAccount,
    clearDeleteStatus,
  } = useSettingsContext();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
  });

  async function confirmDelete() {
    const values = getValues();
    const parsed = deleteAccountSchema.safeParse(values);
    if (!parsed.success) {
      await handleSubmit(() => undefined)();
      return;
    }

    try {
      await submitDeleteAccount(parsed.data);
    } catch {
      return;
    }

    try {
      await logout();
    } catch {
      // session is already dead; user state is cleared by logout()
    }
    navigate("/login", { replace: true });
  }

  return (
    <SectionPanel
      title="Danger zone"
      description="Permanently remove your account and all health data."
      icon={TriangleAlert}
      className="border-destructive/30"
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => {
          clearDeleteStatus();
          setConfirmOpen(true);
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="delete-current-password">Current password</Label>
          <Input
            id="delete-current-password"
            type="password"
            autoComplete="current-password"
            disabled={isDeleteBusy}
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {deleteError && (
          <p role="alert" className="text-sm text-destructive">
            {deleteError}
          </p>
        )}

        <Button type="submit" variant="destructive" disabled={isDeleteBusy}>
          Delete account
        </Button>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleteBusy) {
            setConfirmOpen(false);
            reset({ currentPassword: getValues("currentPassword") });
          }
        }}
        title="Delete your account?"
        description={
          <>
            This permanently removes your account and all saved health data. This
            cannot be undone.
            {deleteError ? (
              <span className="mt-2 block text-destructive">{deleteError}</span>
            ) : null}
          </>
        }
        confirmLabel="Delete account"
        loading={isDeleteBusy}
        onConfirm={confirmDelete}
      />
    </SectionPanel>
  );
}
