import {EntityRepository, Repository} from "typeorm";

import { JournalTemplate } from '../entity/journal_template';
import { JournalTemplate as JournalTemplateArgument } from '../params/journal_template';

import { AccountTransactionTemplate } from '../entity/account_transaction_template';
import { Account } from '../entity/account';
import { RelativeSubtotalCalculator } from '../balance_calculators';

@EntityRepository(JournalTemplate)
export class JournalTemplateRepository extends Repository<JournalTemplate> {

    async addWithTransactions( journalEntryArgument: JournalTemplateArgument ){
        const result: { errors?: any[], record?: JournalTemplate } = {  };
        const journalEntry = new JournalTemplate();

        const queryRunner = this.manager.connection.createQueryRunner();
        await queryRunner.connect();

        await queryRunner.startTransaction("READ UNCOMMITTED");
        try {
            const journalRepository = queryRunner.manager.getRepository( JournalTemplate );
            const accountRepositry = queryRunner.manager.getRepository( Account );
            const accountTransactionRepositry = queryRunner.manager.getRepository( AccountTransactionTemplate );

            journalEntry.description = journalEntryArgument.description;
            journalEntry.validMin = journalEntryArgument.validMin;
            journalEntry.validMax = journalEntryArgument.validMax;

            journalEntry.transactionTemplates = [];
            await journalRepository.insert( journalEntry );
            const calculator = new RelativeSubtotalCalculator();

            for ( const transactionArgument of journalEntryArgument.transactionTemplates ){
                const id = transactionArgument.accountId;
                const account = await accountRepositry.findOne( id, { relations: ["group"] } );
                if ( !account  ) throw new Error( `accountId ${id} unknown` );
                const accountTransaction = new AccountTransactionTemplate();
                accountTransaction.account = account;
                accountTransaction.method = transactionArgument.method;
                accountTransaction.amount = transactionArgument.amount;
                accountTransaction.sign = transactionArgument.sign;
                accountTransaction.journalTemplate = journalEntry;
                accountTransactionRepositry.insert( accountTransaction );
                calculator.add( account.group.category, accountTransaction.method, accountTransaction.amount, accountTransaction.sign );
            }

            const balanceCheck = calculator.checkBalance();

            if (balanceCheck.isBalanced){
                await queryRunner.commitTransaction();
                result.record = journalEntry;
            } else {
                console.error( balanceCheck );
                await queryRunner.rollbackTransaction();
                result.errors = balanceCheck.unbalanced;
            }
        } catch (e) {
            const err: Error = e;
            result.errors = [err.message];
            console.error( "Create journal entry failed", result );
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
        return result;
    }
}
