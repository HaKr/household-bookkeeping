import {getManager, LessThan, Equal} from "typeorm";

import { JsonController, Get, Post, Param, QueryParam } from 'routing-controllers';

import { AccountWithBalance } from '../entity/account_with_balance';
import { Account } from '../entity/account';
import { AccountTransaction } from '../entity/account_transaction';

const CASCADE = { relations: ["transactions", "transactions.journalEntry" ]};

@JsonController( "/account[s]?" )
export class AccountController {
    private accountWithBalanceRepository = getManager().getRepository(AccountWithBalance);
    private accountRepository = getManager().getRepository(Account);
    private accountTransactionRepositry = getManager().getRepository( AccountTransaction );

    @Get()
    getAll( @QueryParam("number") number: string ) {
        if (typeof number === "string" ) return this.accountRepository.findOne( {number}, CASCADE );
        else return this.accountWithBalanceRepository.find();
    }

    @Get("/:id")
    private getOne( @Param("id") id: number ) {
        return this.accountWithBalanceRepository.findOne( {id} );
    }

    @Get("/:id/transactions")
    private async getTransactions( @Param("id") id: number ) {
        const account = await this.accountRepository.findOne( id );
        return account ? this.accountTransactionRepositry.find( {  relations: ["journalEntry"], where: { account } } ) : [];
    }

}
