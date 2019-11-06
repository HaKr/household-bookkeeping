import { OK, BAD_REQUEST } from './http-status-codes';
import { Controller, Middleware, Get, Post, Put, Delete } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Logger } from '@overnightjs/logger';
 
@Controller('api/users')
export class UserController {
 
    @Get(':id')
    private get(req: Request, res: Response) {
        Logger.Info(req.params.id);
        return res.status(OK).json({
            message: 'get_called',
        });
    }
 
    @Get('')
    private getAll(req: Request, res: Response) {
        Logger.Info(req.body, true);
        return res.status(OK).json({
            message: 'get_all_called',
        });
    }
 
    @Post()
    private add(req: Request, res: Response) {
        Logger.Info(req.body, true);
        return res.status(OK).json({
            message: 'add_called',
        });
    }
 
    @Put('update-user')
    private update(req: Request, res: Response) {
        Logger.Info(req.body);
        return res.status(OK).json({
            message: 'update_called',
        });
    }
 
    @Delete('delete/:id')
    private delete(req: Request, res: Response) {
        Logger.Info(req.params, true);
        return res.status(OK).json({
            message: 'delete_called',
        });
    }
 
    @Get('practice/async')
    private async getWithAsync(req: Request, res: Response) {
        try {
            const asyncMsg = await this.asyncMethod(req);
            return res.status(OK).json({
                message: asyncMsg,
            });
        } catch (err) {
            Logger.Err(err, true);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    }
 
    private asyncMethod(req: Request): Promise<string> {
        return new Promise((resolve) => {
            resolve(req.originalUrl + ' called');
        });
    }
}
