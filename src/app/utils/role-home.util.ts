/** Default landing route after login or when access is denied. */
export function homeRouteForRole(role: string | null | undefined): string[] {
  switch (role) {
    case 'ADMIN':
      return ['/admin/dashboard'];
    case 'ENTREPRISE':
      return ['/user/forum'];
    case 'ALUMNI':
    case 'ETUDIANT':
      return ['/dashboard'];
    default:
      return ['/dashboard'];
  }
}
