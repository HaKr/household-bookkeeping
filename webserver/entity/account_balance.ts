import { Connection, ViewEntity, ViewColumn} from "typeorm";
import { Account } from './account';
import { AccountTransaction } from './account_transaction';
@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select("account.id", "id")
        .addSelect( "MIN( account.number )", "number" )
        .addSelect("SUM( account_transaction.sign * account_transaction.amount )", "amount")
        .from(Account, "account")
        .leftJoin(AccountTransaction, "account_transaction", "account_transaction.account_id = account.id")
        .groupBy( "account.id" )
        .printSql()
})
export class AccountBalance {

    @ViewColumn()
    id!: number

    @ViewColumn()
    number!: string

    @ViewColumn()
    amount!: number

}
