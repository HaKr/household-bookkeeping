import { MigrationInterface, QueryRunner, createConnection } from "typeorm";

import { AccountRepository } from "../repository/account_repository";
import { JournalEntryRepository } from '../repository/journal_entry_repository';

import { JournalEntry } from '../params/journal_entry';
import { AccountTransaction } from '../params/account_transaction';

import * as sampleJournal from "../master data/sample_journal.json";
import { JournalTemplateRepository } from '../repository/journal_template_repository';

    async function up(queryRunner: QueryRunner) {
        const accountRepository = queryRunner.manager.getCustomRepository( AccountRepository );
        const journalEntryRepository = queryRunner.manager.getCustomRepository( JournalEntryRepository );
        const journalTemplateRepository = queryRunner.manager.getCustomRepository( JournalTemplateRepository );

        let failed = 0;

        for ( const entry of sampleJournal){
            const journalEntry = new JournalEntry();

            if (typeof entry.template === "string" ){
                const description = entry.template;
                const journalTemplate = await journalTemplateRepository.findOne( {description}, { relations: ["transactionTemplates"]} );
                const forAmount = entry.amount!;
                if (journalTemplate === undefined) throw new Error( "Could not find template "+ description );
                if (!journalTemplate.isValidFor( forAmount )) throw new Error( `Template ${journalTemplate.description} is only valid for amounts between ${journalTemplate.validMin} and ${journalTemplate.validMax} (${forAmount})` )
                const instance = journalTemplate.instantiate( forAmount )
                journalEntry.transactions = instance.transactions;
                journalEntry.description = entry.description ? entry.description : instance.description;
            } else {
                journalEntry.description = entry.description!;

                journalEntry.transactions = [];
                for ( const entryTransaction of entry.transactions! ){
                    const accountTransaction = new AccountTransaction();
                    accountTransaction.sign = entryTransaction.sign;
                    accountTransaction.amount = entryTransaction.amount;
                    const number = entryTransaction.account;
                    const account = await accountRepository.findByNumber( number );
                    if ( account){
                        accountTransaction.accountId = account.id;
                        journalEntry.transactions.push( accountTransaction );
                    } else {
                        failed += 1;
                        console.error( `Account "${number}" not found for ${journalEntry.description}.` );
                    }
                }
            }
            journalEntry.bookingDate = new Date( Date.parse( entry.date ) );
            const result = await journalEntryRepository.addWithTransactions( journalEntry );
            if ( !result.record ) throw new Error( entry.description+ ": " + result.errors!.join( ', ' ) );
        }
        if (failed>0) throw new Error( `Forcing rollback (${failed})...` );
        console.log(`Inserted ${sampleJournal.length} journal entries.`);
    }

createConnection().then(async connection => {
    const queryRunner = connection.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {

        await queryRunner.query( "DELETE FROM account_transaction WHERE account_transaction.id>0");
        await queryRunner.query( "DELETE FROM journal_entry WHERE journal_entry.id>0");
        await queryRunner.commitTransaction();
        
    } catch (err) {
        
        // since we have errors lets rollback changes we made
        await queryRunner.rollbackTransaction();
        
    } 

    await up( queryRunner ).catch( e => console.error( "Fixture error:", e ));
    
    await queryRunner.release();
    connection.close();
}).catch( e => {
    console.error("DB connection error:", e );
});
