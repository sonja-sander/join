import { ContactAvatar } from "./contact-avatar";

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: number | string;
  isAvailable: boolean;
  userColor?: string | null;
  avatar: ContactAvatar | null;
}
