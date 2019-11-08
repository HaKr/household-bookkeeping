import {getManager} from "typeorm";

import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
// import { Logger } from '@overnightjs/logger';

import { Group } from "../entity/group";
import { SUCCESS, ERROR } from '../http-status-codes';
import { Account } from '../entity/account';
import { AccountWithBalance } from '../entity/account_with_balance';

@Controller('account[s]?')
export class AccountController {
    private accountRepository = getManager().getRepository(AccountWithBalance);

    @Get()
    private async getAll(_req: Request, res: Response) {
        const accounts = await this.accountRepository.find();
        return res.status( SUCCESS.OK ).json( accounts );
    }

}
