declare namespace Express {
  interface Request {
    user: { userID: number; email: string };
  }
}
