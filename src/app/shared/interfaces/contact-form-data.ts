import { ContactAvatar } from "./contact-avatar";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  avatar: ContactAvatar | null;
}
