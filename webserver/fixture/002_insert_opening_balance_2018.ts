import { QueryRunner, In } from "typeorm";

import { FixtureRunner } from "./fixture_runner";

import { DebitOrCredit } from '../constants';

import { JournalEntryRepository } from '../repository/journal_entry_repository';

import { JournalEntry } from '../params/journal_entry';
import { AccountTransaction } from '../params/account_transaction';

const DESCRIPTION = "Opening balance 2018";

const openingBalances = [
    { account: "1301", sign: DebitOrCredit.Debit,  amount: 1753.16 },
    { account: "0362", sign: DebitOrCredit.Credit, amount:  600 },
    { account: "0371", sign: DebitOrCredit.Credit, amount:  500 },
    { account: "0372", sign: DebitOrCredit.Credit, amount:  500 },
    { account: "0399", sign: DebitOrCredit.Credit, amount:  153.16 },
    { account: "0299", sign: DebitOrCredit.Debit,  amount: 1943.65 },
    { account: "1201", sign: DebitOrCredit.Credit, amount: 1943.65 }
];

const openingBalanceStatement: JournalEntry = {
    bookingDate: new Date( 2017, 11, 31, 23, 59 ),
    description: DESCRIPTION,
    transactions: []
};

class InsertOpeningBalance2018 extends FixtureRunner {
    protected journalEntryRepository: JournalEntryRepository = null as any;

    protected transactionStarted() {
        this.journalEntryRepository = this.transaction.getCustomRepository( JournalEntryRepository );
    }

    protected async remove()
    {
        return this.journalEntryRepository.delete( { description: DESCRIPTION } );
    }

    protected async insert()
    {
        for ( const openingBalance of openingBalances ){
            const accountTransaction = new AccountTransaction();
            accountTransaction.sign = openingBalance.sign;
            accountTransaction.amount = openingBalance.amount;
            const number = openingBalance.account;
            const account = await this.findAccountByNumber( number );
            if ( account){
                accountTransaction.accountId = account.id;
                openingBalanceStatement.transactions.push( accountTransaction );
            } else {
                this.notifyError( `Account "${number}" not found.` );
            }
        }     
        if ( this.isOK ){
            const result = await this.journalEntryRepository.addWithTransactions( openingBalanceStatement, this.queryRunner );
            if ( !result.record ) this.notifyError( DESCRIPTION+ ": " + result.errors!.join( ', ' ) );
            else console.log(`Inserted opening balance for ${openingBalances.length} accounts.`);
        }
    }
}

new InsertOpeningBalance2018().run();
