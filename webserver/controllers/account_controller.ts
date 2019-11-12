import {getManager} from "typeorm";

import { Request, Response } from 'express';
import { JsonController, Get, Post } from 'routing-controllers';

import { SUCCESS, ERROR } from '../http-status-codes';
import { AccountWithBalance } from '../entity/account_with_balance';

@JsonController( "/account[s]?" )
export class AccountController {
    private accountRepository = getManager().getRepository(AccountWithBalance);

    @Get()
    getAll() {
        return this.accountRepository.find();
    }

}
