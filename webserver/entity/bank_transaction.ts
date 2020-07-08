import { Entity, Column, OneToOne, ManyToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { BankAccount } from './bank_account';
import { DebitOrCredit, CURRENCY_DIMENSIONS, SIZES } from '../constants';
import { JournalEntry } from './journal_entry';

@Entity()
export class BankTransaction extends SharedEntityColumns {

    @ManyToOne( type => BankAccount, bankAccount => bankAccount.transactions )
    bankAccount!: BankAccount

    @Column( {
        default: DebitOrCredit.Debit
    })
    sign!: DebitOrCredit;

    @Column( CURRENCY_DIMENSIONS )
    amount: number = 0.00;

    @Column( {type: "varchar", length: SIZES.REFERENCE } )
    relationReference!: string

    @Column( {type: "varchar", length: SIZES.BANK_DESCRIPTION })
    description!: string;

    @OneToOne( () => JournalEntry, journalEntry => journalEntry.bankTransaction, { nullable: true } )
    journalEntry!: JournalEntry 
}
