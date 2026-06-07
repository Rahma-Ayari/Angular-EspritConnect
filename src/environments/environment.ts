export const environment = {
  production: false,
  apiUrl: 'http://localhost:8088/espritconnect',
  frontApi: 'http://localhost:8088/espritconnect/api/front',
  backApi: 'http://localhost:8088/espritconnect/api/back',
  /** Optional dev logins — create matching users in the backend or adjust emails/passwords */
  devAuth: {
    admin: { email: 'admin@esprit.tn', password: 'admin123' },
    student: { email: 'student@esprit.tn', password: 'student123' }
  }
};
