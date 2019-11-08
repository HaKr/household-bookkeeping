import { Connection, ViewEntity, ViewColumn} from "typeorm";

import { AccountWithBalance } from './account_with_balance';
import { Group } from './group';

@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select("group.category", "category")
        .addSelect("SUM( account_with_balance.amount )", "amount")
        .from(Group, "group")
        .where( "category is not null" )
        .leftJoin(
            AccountWithBalance, "account_with_balance",
            "account_with_balance.groupId IN (SELECT group.id FROM ledger.group g WHERE g.category = group.category)"
        )
        .groupBy( "group.category" )
})
export class GroupCategoryBalance {

    @ViewColumn()
    category!: string


    @ViewColumn()
    amount!: string

}
