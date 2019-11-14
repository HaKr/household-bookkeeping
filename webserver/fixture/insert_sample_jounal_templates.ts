import { QueryRunner, createConnection } from "typeorm";

import { AccountRepository } from "../repository/account_repository";
import { JournalTemplateRepository } from '../repository/journal_template_repository';

import { JournalTemplate } from '../params/journal_template';
import { AccountTransactionTemplate } from '../params/account_transaction template';

import * as sampleJournalTemplates from "../master data/sample_journal_templates.json";

    async function up(queryRunner: QueryRunner) {
        const accountRepository = queryRunner.manager.getCustomRepository( AccountRepository );
        const journalTemplateRepository = queryRunner.manager.getCustomRepository( JournalTemplateRepository );

        let failed = 0;

        for ( const template of sampleJournalTemplates){
            const journalTemplate = new JournalTemplate();
            journalTemplate.description = template.description;
            journalTemplate.validFor = template.validFor;
            journalTemplate.transactionTemplates = [];

            for ( const templateTransaction of template.transactions ){
                const accountTransaction = new AccountTransactionTemplate();
                accountTransaction.sign = templateTransaction.sign;
                accountTransaction.fixed = templateTransaction.fixed!;
                accountTransaction.percentage = templateTransaction.percentage!;

                const number = templateTransaction.account;
                const account = await accountRepository.findByNumber( number );
                if ( account){
                    accountTransaction.accountId = account.id;
                    journalTemplate.transactionTemplates.push( accountTransaction );
                } else {
                    failed += 1;
                    console.error( `Account "${number}" not found for ${journalTemplate.description}.` );
                }
            }
            const result = await journalTemplateRepository.addWithTransactions( journalTemplate );
            if ( !result.record ) throw new Error( template.description+ ": " + result.errors!.join( ', ' ) );
        }
        if (failed>0) throw new Error( `Forcing rollback (${failed})...` );
        console.log(`Inserted ${sampleJournalTemplates.length} journal entries.`);
    }

createConnection().then(async connection => {
    const queryRunner = connection.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {

        await queryRunner.query( "DELETE FROM account_transaction_template WHERE account_transaction_template.id>0");
        await queryRunner.query( "DELETE FROM journal_template WHERE journal_template.id>0");
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
