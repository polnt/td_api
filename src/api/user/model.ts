interface AuthPayload {
  email: string;
  password: string;
}

interface User {
  id?: number;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export { AuthPayload, User };
