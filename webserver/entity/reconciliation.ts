import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, VersionColumn, OneToMany } from 'typeorm';

import { CURRENCY_DIMENSIONS } from "../constants";

import { BankAccount } from "./bank_account";
import { Relation } from "./relation";
import { ReconciliationPeriod } from './reconciliation_period';

@Entity()
export class Reconciliation  {
    @PrimaryGeneratedColumn()
    id!: number;

    @VersionColumn()
    version!: number;

    @ManyToOne( () => BankAccount, bankAccount => bankAccount.reconciliations )
    bankAccount!: BankAccount;

    @ManyToOne( () => Relation )
    relation!: Relation

    @OneToMany( () => ReconciliationPeriod, reconciliationPeriod => reconciliationPeriod.reconciliation )
    periods!: ReconciliationPeriod[]

}
