import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

import { BankAccount } from "./bank_account";
import { JournalTemplate } from "./journal_template";
import { Relation } from "./relation";

@Entity()
export class BankAccountJournalTemplateConnection  {
    @PrimaryGeneratedColumn()
    id!: number;

    @VersionColumn()
    version!: number;

    @ManyToOne( () => BankAccount, bankAccount => bankAccount.templateConnections )
    bankAccount!: BankAccount;

    @ManyToOne( () => Relation )
    relation!: Relation

    @Column()
    validFrom!: Date

    @Column()
    validUntil!: Date

    @ManyToOne( () => JournalTemplate, journalTemplate => journalTemplate.templateConnections )
    journalTemplate!: JournalTemplate;
}
