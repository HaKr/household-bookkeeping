import { Entity, Column, OneToMany } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { AccountTransaction } from './account_transaction';

@Entity()
export class JournalEntry extends SharedEntityColumns {
    @Column()
    bookingDate!: Date;

    @Column()
    description!: string;

    @OneToMany( type => AccountTransaction, accountTransaction => accountTransaction.account )
    transactions!: AccountTransaction[]
}