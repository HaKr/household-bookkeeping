import {ViewEntity, ViewColumn, Connection, ManyToOne} from "typeorm";
import { Post } from '@overnightjs/core';
import { Account } from './account';
import { AccountBalance } from './account_balance';
import { Group } from './group';

@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .addSelect( "account.id", "id")
        .addSelect( "account.version", "version")
        .addSelect( "account.number", "number")
        .addSelect( "account.name", "name")
        .addSelect( "account.groupId", "groupId")
        .addSelect( "balances.amount", "amount")
        .from( Account, "account" )
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
    amount!: string

    @ManyToOne( type => Group, group => group.accounts, {eager: true} )
    group!: Group

}