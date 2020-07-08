import {EntityRepository, Repository, QueryRunner} from "typeorm";

import { JournalTemplate } from '../entity/journal_template';
import { JournalTemplate as JournalTemplateArgument } from '../params/journal_template';

import { AccountTransactionTemplate } from '../entity/account_transaction_template';
import { Account } from '../entity/account';
import { RelativeSubtotalCalculator } from '../balance_calculators';

@EntityRepository(JournalTemplate)
export class JournalTemplateRepository extends Repository<JournalTemplate> {

    async addWithTransactions( journalEntryArgument: JournalTemplateArgument, runner: QueryRunner | null = null ){
        const result: { errors?: any[], record?: JournalTemplate } = {  };
        const journalTemplate = new JournalTemplate();
        const isolated = runner === null;
        const queryRunner = isolated ? this.manager.connection.createQueryRunner() : runner!;
        if ( isolated )
        {
            await queryRunner.connect();

            await queryRunner.startTransaction("READ UNCOMMITTED");
        }

        try {
            const journalTemplateRepository = queryRunner.manager.getRepository( JournalTemplate );
            const accountRepositry = queryRunner.manager.getRepository( Account );
            const accountTransactionTemplateRepositry = queryRunner.manager.getRepository( AccountTransactionTemplate );

            journalTemplate.description = journalEntryArgument.description;
            journalTemplate.validMin = journalEntryArgument.validMin;
            journalTemplate.validMax = journalEntryArgument.validMax;

            journalTemplate.transactionTemplates = [];
            await journalTemplateRepository.insert( journalTemplate );
            const calculator = new RelativeSubtotalCalculator();

            for ( const transactionArgument of journalEntryArgument.transactionTemplates ){
                let category: string;
                const accountTransaction = new AccountTransactionTemplate();
                const id = transactionArgument.accountId;
                if (id > 0){
                    const account = await accountRepositry.findOne( id, { relations: ["group"] } );
                    if ( !account  ) throw new Error( `accountId ${id} unknown` );
                    accountTransaction.account = account;
                    category = account.group.category;
                } else category = "B";
                accountTransaction.method = transactionArgument.method;
                accountTransaction.amount = transactionArgument.amount;
                accountTransaction.sign = transactionArgument.sign;
                accountTransaction.journalTemplate = journalTemplate;
                accountTransactionTemplateRepositry.insert( accountTransaction );
                calculator.add( category, accountTransaction.calculateMethod, accountTransaction.calculateAmount, accountTransaction.sign );
            }

            const balanceCheck = calculator.checkBalance();

            if (balanceCheck.isBalanced){
                if ( isolated ) await queryRunner.commitTransaction();
                result.record = journalTemplate;
            } else {
                console.error( balanceCheck );
                if ( isolated ) await queryRunner.rollbackTransaction();
                result.errors = balanceCheck.unbalanced;
            }
        } catch (e) {
            const err: Error = e;
            result.errors = [err.message];
            console.error( "Create journal entry failed", result );
            if ( isolated ) await queryRunner.rollbackTransaction();
        } finally {
            if ( isolated ) await queryRunner.release();
        }
        return result;
    }
}
