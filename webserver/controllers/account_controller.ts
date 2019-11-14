import {getManager} from "typeorm";

import { JsonController, Get, Post, Param, QueryParam } from 'routing-controllers';

import { AccountWithBalance } from '../entity/account_with_balance';
import { Account } from '../entity/account';

@JsonController( "/account[s]?" )
export class AccountController {
    private accountWithBalanceRepository = getManager().getRepository(AccountWithBalance);
    private accountRepository = getManager().getRepository(Account);

    @Get()
    getAll( @QueryParam("number") number: string ) {
        if (typeof number === "string" ) return this.accountRepository.findOne( {number}, { relations: ["transactions"]} );
        else return this.accountWithBalanceRepository.find();
    }

    @Get("/:id")
    private getOne( @Param("id") id: number ) {
        return this.accountWithBalanceRepository.findOne( {id} );
    }
}
