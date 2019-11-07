import {ViewEntity, ViewColumn, Connection} from "typeorm";
import { Post } from '@overnightjs/core';
import { Account } from './account';
import { AccountBalance } from './account_balance';

@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder(Account, "account")
        .addSelect( "balances.amount", "amount")
        .leftJoin(AccountBalance, "balances", "balances.id = account.id")
})
export class AccountWithBalance {
    @ViewColumn()
    id!: number;

    @ViewColumn()
    number!: string;

    @ViewColumn()
    name!: string;

    @ViewColumn()
    amount!: number
}