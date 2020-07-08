import { Connection, ViewEntity, ViewColumn, JoinColumn} from "typeorm";
import { Account } from './account';
import { AccountTransaction } from './account_transaction';
@ViewEntity({ 
    expression: (connection: Connection) => connection.createQueryBuilder()
        .select("account.id", "id")
        .addSelect("SUM( account_transaction.sign * account_transaction.amount )", "balance")
        .from(Account, "account")
        .leftJoin(AccountTransaction, "account_transaction", "account_transaction.account_id = account.id")
        .groupBy( "account.id" )
        .printSql()
})
export class AccountBalance {

    @ViewColumn()
    id!: number

    @ViewColumn()
    balance!: number

}
