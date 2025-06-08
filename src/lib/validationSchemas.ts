import * as Yup from "yup";

// Login validation schema
export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Register validation schema
export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  referral: Yup.string().optional(),
});

// Reset password validation schema
export const resetPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
});

// Reset password confirm validation schema
export const resetPasswordConfirmSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Confirm password does not match")
    .required("Confirm password is required"),
});

// Profile update validation schema
export const profileUpdateSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});

// Payment proof validation schema
export const paymentProofSchema = Yup.object({
  paymentProof: Yup.mixed()
    .required("Payment proof is required")
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      const file = value as File;
      return file.size <= 5 * 1024 * 1024; // 5MB
    })
    .test("fileType", "File type must be JPEG, PNG, or PDF", (value) => {
      if (!value) return true;
      const file = value as File;
      return [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ].includes(file.type);
    }),
});

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  referral: string;
}

export interface ResetPasswordFormValues {
  email: string;
}

export interface ResetPasswordConfirmFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateFormValues {
  name: string;
  email: string;
  password: string;
}

export interface PaymentProofFormValues {
  paymentProof: File | null;
}
