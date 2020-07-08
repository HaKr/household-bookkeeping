import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

import { CURRENCY_DIMENSIONS, SIZES } from "../constants";

import { JournalTemplate } from "./journal_template";
import { ReconciliationPeriod } from './reconciliation_period';

@Entity()
export class ReconciliationMatch {
    @PrimaryGeneratedColumn()
    id!: number;

    @VersionColumn()
    version!: number;

    @ManyToOne( ()=> ReconciliationPeriod )
    reconciliationPeriod!: ReconciliationPeriod

    @Column( CURRENCY_DIMENSIONS )
    amountFrom!: number

    @Column( CURRENCY_DIMENSIONS )
    amountUntil!: number

    @Column( {type: "varchar", length: SIZES.DESCRIPTION, nullable: true } )
    trigger!: string | null

    @ManyToOne( () => JournalTemplate )
    journalTemplate!: JournalTemplate;
}
