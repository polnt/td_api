import { NextFunction, Request, Response } from 'express';

import {
  LogicError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  UnsupportedMediaTypeError,
} from 'app/utils';

export const exceptionsFilter = (
  err: Error,
  _: Request,
  response: Response,
  next: NextFunction
) => {
  let message = 'internal server error';
  let status = 500;

  switch ((err as any).constructor) {
    case LogicError:
      message = (err as LogicError).message;
      status = 400;
      break;
    case UnauthorizedError:
      message = (err as UnauthorizedError).message;
      status = 401;
      break;

    case ForbiddenError:
      message = (err as ForbiddenError).message;
      status = 403;
      break;

    case NotFoundError:
      message = (err as NotFoundError).message || 'Resource not found';
      status = 404;
      break;

    case ConflictError:
      message = (err as ConflictError).message;
      status = 409;
      break;

    case UnsupportedMediaTypeError:
      message = (err as UnsupportedMediaTypeError).message;
      status = 415;
      break;

    default:
      break;
  }

  response.status(status).json({ status, message });
  next();
};
