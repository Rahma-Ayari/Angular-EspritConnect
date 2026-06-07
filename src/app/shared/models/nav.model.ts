export type NavbarVariant = 'dark' | 'light';

export interface SidebarItem {
  id: string;
  label: string;
  icon: 'home' | 'hand' | 'users' | 'mail' | 'briefcase' | 'settings' | 'chat' | 'chevron';
  route?: string;
  children?: SidebarItem[];
  /** Bandeau rouge type “Email Communications” */
  accent?: boolean;
  /** Barre rouge à gauche (page courante) */
  active?: boolean;
}