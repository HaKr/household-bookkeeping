import {EntityRepository, Repository, QueryRunner} from "typeorm";

import { JournalEntry } from '../entity/journal_entry';
import { JournalEntry as JournalEntryArgument } from '../params/journal_entry';

import { AccountTransaction } from '../entity/account_transaction';
import { GroupCategoryBalance } from '../entity/category_balance';
import { Account } from '../entity/account';

@EntityRepository(JournalEntry)
export class JournalEntryRepository extends Repository<JournalEntry> {

    async addWithTransactions( journalEntryArgument: JournalEntryArgument, runner: QueryRunner | null = null ){
        const result: { errors?: string[], record?: JournalEntry } = {  };
        const journalEntry = new JournalEntry();
        const isolated = runner === null;
        const queryRunner = isolated ? this.manager.connection.createQueryRunner() : runner!;

        if (isolated){
            await queryRunner.connect();

            await queryRunner.startTransaction("READ UNCOMMITTED");
        }
        try {
            const journalRepository = queryRunner.manager.getRepository( JournalEntry );
            const accountRepositry = queryRunner.manager.getRepository( Account );
            const accountTransactionRepositry = queryRunner.manager.getRepository( AccountTransaction );

            journalEntry.bookingDate = journalEntryArgument.bookingDate;
            journalEntry.description = journalEntryArgument.description;
            journalEntry.transactions = [];
            await journalRepository.insert( journalEntry );

            for ( const transactionArgument of journalEntryArgument.transactions ){
                const id = transactionArgument.accountId;
                const account = await accountRepositry.findOne( id );
                if ( !account  ) throw new Error( `accountId ${id} unknown` );
                const accountTransaction = new AccountTransaction();
                accountTransaction.account = account;
                accountTransaction.amount = transactionArgument.amount;
                accountTransaction.sign = transactionArgument.sign;
                accountTransaction.journalEntry = journalEntry;
                accountTransactionRepositry.insert( accountTransaction );
            }
            const groupCategoryBalanceRepository = queryRunner.manager.getRepository( GroupCategoryBalance );
            
            const categoryBalances = await groupCategoryBalanceRepository.find();
            const messages: string[] = [];

            for (const categoryBalance of categoryBalances ){
                if (Math.round(categoryBalance.balance*100) != 0 ) {
                    messages.push( `Category "${categoryBalance.category}" has balance ${categoryBalance.balance<0 ? "CR" : "DB"} ${Math.abs(categoryBalance.balance)}.` );
                }
            }

            if (messages.length > 0){
                if (isolated ) await queryRunner.rollbackTransaction();
                result.errors = messages;
            } else {
                if (isolated ) await queryRunner.commitTransaction();
                result.record = journalEntry;
            }
        } catch (e) {
            const err: Error = e;
            result.errors = [err.message];
            console.error( "Create journal entry failed", result );
            if (isolated ) await queryRunner.rollbackTransaction();
        } finally {
            if ( isolated ) await queryRunner.release();
        }
        return result;
    }
}
