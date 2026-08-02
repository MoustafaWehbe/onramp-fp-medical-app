export interface UpdateEmailRequest {
  currentPassword: string;
  newEmail: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountRequest {
  currentPassword: string;
}
