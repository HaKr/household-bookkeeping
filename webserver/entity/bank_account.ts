import { Entity, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";

import { SharedEntityColumns } from '../shared_enity_columns';

import { BankTransaction } from './bank_transaction';
import { MinLength, IsDate } from 'class-validator';
import { Reconciliation } from './reconciliation';
import { Account } from './account';

@Entity()
export class BankAccount extends SharedEntityColumns {

    @MinLength( 10 )
    @Column( {length: 25, unique: true} )
    iban!: string

    @MinLength( 5 )
    @Column()
    name!: string;

    @OneToOne( () => Account )
    @JoinColumn()
    account!: Account

    @OneToMany( type => BankTransaction, bankTransaction => bankTransaction.bankAccount )
    transactions!: BankTransaction[];

    @OneToMany( type => Reconciliation, reconciliation => reconciliation.bankAccount )
    reconciliations!: Reconciliation[];

}
