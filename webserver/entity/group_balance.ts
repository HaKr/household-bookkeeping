import { Connection, ViewEntity, ViewColumn} from "typeorm";

import { AccountWithBalance } from './account_with_balance';
import { Group } from './group';

@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select("group.id", "id")
        .addSelect( "MIN( group.number )", "number" )
        .addSelect("SUM( account_with_balance.balance )", "balance")
        .from(Group, "group")
        .leftJoin(AccountWithBalance, "account_with_balance", "account_with_balance.groupId = group.id")
        .groupBy( "group.id" )
})
export class GroupBalance {

    @ViewColumn()
    id!: number

    @ViewColumn()
    number!: string

    @ViewColumn()
    balance!: number

}
