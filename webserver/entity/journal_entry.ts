import { Entity, Column, OneToMany, OneToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { AccountTransaction } from './account_transaction';
import { MinLength, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BankTransaction } from './bank_transaction';

@Entity()
export class JournalEntry extends SharedEntityColumns {
    @IsDate()
    @Type( () => Date )
    @Column()
    bookingDate!: Date;

    @MinLength( 5 )
    @Column()
    description!: string;

    @OneToMany( type => AccountTransaction, accountTransaction => accountTransaction.journalEntry )
    transactions!: AccountTransaction[];

    @OneToOne( () => BankTransaction, bankTransaction => bankTransaction.journalEntry, { nullable: true} )
    bankTransaction!: BankTransaction
}
