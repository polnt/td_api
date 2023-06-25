import autoBind from 'auto-bind';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from 'app/inversion-of-control/types';
import { UserService } from './service';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {
    autoBind(this);
  }

  public async create(req: Request, res: Response): Promise<void> {
    const result = await this.userService.create(req.body);
    res.status(result.status).json(result);
  }

  public async authenticate(
    request: Request,
    response: Response
  ): Promise<void> {
    const auth: any = await this.userService.authenticate(request.body);
    response.status(auth.status).json(auth);
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const result = await this.userService.delete(req.body);
    res.status(result.status).json(result);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { userID } = req.user;
    const result = await this.userService.update(userID, req.body);
    res.status(result.status).json(result);
  }

  public async getCurrentUser(req: Request, res: Response) {
    const { userID } = req.user;
    const result = await this.userService.getOne(userID);
    res.status(result.status).json(result);
  }
}
