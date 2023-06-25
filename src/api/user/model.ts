interface AuthPayload {
  email: string;
  password: string;
}

interface iUser {
  id?: number;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
}

export { AuthPayload, iUser };
