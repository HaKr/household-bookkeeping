import { Entity, Column, OneToMany } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { BankTransaction } from './bank_transaction';
import { MinLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BankAccountJournalTemplateConnection } from './bank_account_journal_template_connection';

@Entity()
export class BankAccount extends SharedEntityColumns {

    @MinLength( 10 )
    @Column( {length: 25, unique: true} )
    iban!: string

    @MinLength( 5 )
    @Column()
    name!: string;

    @OneToMany( type => BankTransaction, bankTransaction => bankTransaction.bankAccount )
    transactions!: BankTransaction[];

    @OneToMany( type => BankAccountJournalTemplateConnection, templateConnection => templateConnection.bankAccount )
    templateConnections!: BankAccountJournalTemplateConnection[];
}
