export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: number | string;
  isAvailable: boolean;
  userColor?: string | null;
}
