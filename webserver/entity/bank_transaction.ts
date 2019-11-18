import { Entity, Column, OneToOne, ManyToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { BankAccount } from './bank_account';
import { DebitOrCredit, CURRENCY_DIMENSIONS } from '../constants';
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


    @Column( {type: "varchar", length: 64} )
    relationReference!: string

    @Column( {type: "varchar", length: 400})
    description!: string;

    @OneToOne( () => JournalEntry, journalEntry => journalEntry.bankTransaction, { nullable: true } )
    journalEntry!: JournalEntry 
}
