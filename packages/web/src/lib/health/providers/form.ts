import { z } from "zod";
import type { UserClinic, UserDoctor } from "./types";

export const clinicFormSchema = z
  .object({
    nameQuery: z.string().min(1, "Enter a clinic name"),
    clinicId: z
      .string()
      .uuid("Select a clinic from the list")
      .optional(),
    address: z.string().max(5000).optional(),
    phone: z.string().max(50).optional(),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.clinicId) {
      if (!data.address?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required for new clinics",
          path: ["address"],
        });
      }
      if (!data.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone is required for new clinics",
          path: ["phone"],
        });
      }
    }
  });

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;

export interface ClinicFormSubmitPayload {
  clinicId?: string;
  address?: string;
  phone?: string;
  notes?: string | null;
}

export function emptyClinicFormValues(): ClinicFormValues {
  return {
    nameQuery: "",
    clinicId: undefined,
    address: "",
    phone: "",
    notes: "",
  };
}

export function toClinicFormValues(
  initial?: UserClinic | null,
): ClinicFormValues {
  if (!initial) return emptyClinicFormValues();

  return {
    nameQuery: initial.clinic.name,
    clinicId: initial.clinicId,
    address: initial.clinic.address,
    phone: initial.clinic.phone,
    notes: initial.notes ?? "",
  };
}

export function toClinicSubmitPayload(
  values: ClinicFormValues,
): ClinicFormSubmitPayload {
  return {
    clinicId: values.clinicId,
    address: values.address?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    notes: values.notes?.trim() ? values.notes.trim() : null,
  };
}

export const doctorFormSchema = z
  .object({
    nameQuery: z.string().min(1, "Enter a doctor name"),
    doctorId: z
      .string()
      .uuid("Select a doctor from the list")
      .optional(),
    specialty: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    userClinicId: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().uuid().optional(),
    ),
    notes: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.doctorId) {
      if (!data.specialty?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Specialty is required for new doctors",
          path: ["specialty"],
        });
      }
      if (!data.phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone is required for new doctors",
          path: ["phone"],
        });
      }
    }
  });

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

export interface DoctorFormSubmitPayload {
  doctorId?: string;
  specialty?: string;
  phone?: string;
  userClinicId?: string | null;
  notes?: string | null;
}

export function emptyDoctorFormValues(): DoctorFormValues {
  return {
    nameQuery: "",
    doctorId: undefined,
    specialty: "",
    phone: "",
    userClinicId: undefined,
    notes: "",
  };
}

export function toDoctorFormValues(
  initial?: UserDoctor | null,
): DoctorFormValues {
  if (!initial) return emptyDoctorFormValues();

  return {
    nameQuery: initial.doctor.name,
    doctorId: initial.doctorId,
    specialty: initial.doctor.specialty,
    phone: initial.doctor.phone,
    userClinicId: initial.userClinicId ?? undefined,
    notes: initial.notes ?? "",
  };
}

export function toDoctorSubmitPayload(
  values: DoctorFormValues,
): DoctorFormSubmitPayload {
  return {
    doctorId: values.doctorId,
    specialty: values.specialty?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    userClinicId: values.userClinicId || null,
    notes: values.notes?.trim() ? values.notes.trim() : null,
  };
}
