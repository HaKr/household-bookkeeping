import {ViewEntity, ViewColumn, Connection, ManyToOne, OneToMany} from "typeorm";
import { Account } from './account';
import { AccountBalance } from './account_balance';
import { Group } from './group';

@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .addSelect( "account.id", "id" )
        .addSelect( "account.version", "version" )
        .addSelect( "account.number", "number" )
        .addSelect( "account.name", "name" )
        .addSelect( "account.groupId", "groupId" )
        .addSelect( "balances.balance", "balance" )
        .from( Account, "account" )
        .leftJoin( AccountBalance, "balances", "balances.id = account.id" )
})
export class AccountWithBalance {
    @ViewColumn()
    id!: number;

    @ViewColumn()
    number!: string;

    @ViewColumn()
    name!: string;

    @ViewColumn()
    balance!: number;

    @ManyToOne( type => Group )
    group!: Group;
}
