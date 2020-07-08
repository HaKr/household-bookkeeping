import { Repository, MoreThan } from 'typeorm';

import { FixtureRunner } from './fixture_runner';

import { DebitOrCredit } from '../constants';

import { JournalTemplateRepository } from '../repository/journal_template_repository';

import { JournalTemplate } from '../params/journal_template';
import { AccountTransactionTemplate } from '../params/account_transaction template';

import * as sampleJournalTemplates from "../master data/sample_journal_templates.json";

interface JsonTransaction {
    bank?: boolean,
    account?: string;
    percentage?: number;
    fixed?: number;
    sign?: DebitOrCredit;
}

class InsertJournalTemplates extends FixtureRunner {
    protected journalTemplateRepository: JournalTemplateRepository = null as any;
    protected accountTransactionTemplateRepository: Repository<AccountTransactionTemplate> = null as any;

    protected transactionStarted() {
        this.journalTemplateRepository = this.transaction.getCustomRepository( JournalTemplateRepository );
        this.accountTransactionTemplateRepository = this.transaction.getRepository( AccountTransactionTemplate );
    }

    protected async remove() {
        await this.accountTransactionTemplateRepository.delete({})
        return this.journalTemplateRepository.delete({});
    }

    protected async insert() {
        for ( const template of sampleJournalTemplates){
            const journalTemplate = new JournalTemplate();
            journalTemplate.description = template.description;
            const validFor = template.validFor === undefined ? [ -999999999.99, 999999999.99 ] : template.validFor;
            journalTemplate.validFor = validFor;
            journalTemplate.transactionTemplates = [];
            const transactions: JsonTransaction[] = template.transactions;
            for ( const templateTransaction of transactions ){
                const accountTransaction = new AccountTransactionTemplate();
                accountTransaction.sign = templateTransaction.bank ? DebitOrCredit.Debit : templateTransaction.sign!;
                accountTransaction.fixed = templateTransaction.fixed!;
                accountTransaction.percentage = templateTransaction.bank ? 100 : templateTransaction.percentage!;

                if (templateTransaction.hasOwnProperty("bank") ){
                    accountTransaction.accountId = -1;
                } else {
                    const number = templateTransaction.account!;
                    const account = await this.findAccountByNumber( number );
                    if ( account){
                        accountTransaction.accountId = account.id;
                    } else {
                        this.notifyError( `Account "${number}" not found for ${journalTemplate.description}.` );
                    }
                }
                journalTemplate.transactionTemplates.push( accountTransaction );
            }
            if (this.isOK){
                const result = await this.journalTemplateRepository.addWithTransactions( journalTemplate, this.queryRunner );
                if ( !result.record ) this.notifyError( template.description+ ": " + result.errors!.join( ', ' ) );
            }
        }
        if ( this.isOK ) console.log(`Inserted ${sampleJournalTemplates.length} journal templates.`);
    }
}

new InsertJournalTemplates().run();
