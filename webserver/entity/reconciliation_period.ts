import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, VersionColumn, OneToMany } from 'typeorm';

import { Reconciliation } from "./reconciliation";
import { ReconciliationMatch } from './reconciliation_match';

@Entity()
export class ReconciliationPeriod  {
    @PrimaryGeneratedColumn()
    id!: number;

    @VersionColumn()
    version!: number;

    @ManyToOne( ()=> Reconciliation )
    reconciliation!: Reconciliation;

    @Column( {type: "date"} )
    validFrom!: Date

    @Column( {type: "date"} )
    validUntil!: Date;

    @OneToMany( () => ReconciliationMatch, reconciliationMatch => reconciliationMatch.reconciliationPeriod )
    matches!: ReconciliationMatch[];

}
