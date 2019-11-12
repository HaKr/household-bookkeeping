import { MigrationInterface, QueryRunner } from "typeorm";

import { AccountRepository } from "../repository/account_repository";

import { Account } from '../entity/account';
import { JournalEntry } from '../entity/journal_entry';
import { AccountTransaction } from '../entity/account_transaction';

import * as config from "../master data/sample_journal.json";

export class InsertDummyData implements MigrationInterface{
    name = "Insert dummy data 1573134559887"
    
    async up(queryRunner: QueryRunner) {
        const accountRepository = queryRunner.manager.getCustomRepository( AccountRepository );
        let failed = 0;

        for ( const entry of config){
            const journalEntry = new JournalEntry();
            journalEntry.bookingDate = new Date( Date.parse( entry.date ) );
            journalEntry.description = entry.description;
            await queryRunner.manager.save( journalEntry );

            for ( const entryTransaction of entry.transactions ){
                const accountTransaction = new AccountTransaction();
                accountTransaction.journalEntry = journalEntry;
                accountTransaction.sign = entryTransaction.sign;
                accountTransaction.amount = entryTransaction.amount;
                const number = entryTransaction.account;
                const accountId = await accountRepository.findByNumber( number );
                if ( accountId){
                    const account = new Account()
                    account.id = accountId.id;
                    accountTransaction.account = account;
                    await queryRunner.manager.save( accountTransaction );
                } else {
                    failed += 1;
                    console.error( `Account "${number}" not found for ${journalEntry.description}.` );
                }
            }
        }
        if (failed>0) throw new Error( `Forcing rollback (${failed})...` );
    }

    async down( queryRunner: QueryRunner ) {
        await  queryRunner.query( "DELETE FROM account_transaction WHERE account_transaction.id>0");
        return queryRunner.query( "DELETE FROM journal_entry WHERE journal_entry.id>0");
    }
}
