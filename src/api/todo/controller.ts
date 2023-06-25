import autoBind from 'auto-bind';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import TYPES from 'app/inversion-of-control/types';
import { TodoService } from './service';

@injectable()
export class TodoController {
  constructor(@inject(TYPES.TodoService) private todoService: TodoService) {
    autoBind(this);
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { userID } = req.user;
    const result = await this.todoService.getOne(+id, userID);
    res.status(result.status).json(result);
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    const { userID } = req.user;
    const result = await this.todoService.getAll(userID);
    res.status(result.status).json(result);
  }

  public async create(req: Request, res: Response): Promise<void> {
    const { userID } = req.user;
    const result = await this.todoService.create(userID, req.body);
    res.status(result.status).json(result);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { userID } = req.user;
    const result = await this.todoService.update(+id, userID, req.body);
    res.status(result.status).json(result);
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { userID } = req.user;
    const result = await this.todoService.delete(+id, userID);
    res.status(result.status).json(result);
  }
}
