import { Entity, Column, OneToOne, ManyToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { JournalEntry } from './journal_entry';
import { Account } from './account';
import { DebitOrCredit, CURRENCY_DIMENSIONS } from '../constants';

@Entity()
export class AccountTransaction extends SharedEntityColumns {
    @ManyToOne( type => JournalEntry, journalEntry => journalEntry.transactions )
    journalEntry!: JournalEntry

    @ManyToOne( type => Account, account => account.transactions )
    account!: Account

    @Column( {
        default: DebitOrCredit.Debit
    })
    sign!: DebitOrCredit;

    @Column( CURRENCY_DIMENSIONS )
    amount: number = 0.00;
}
