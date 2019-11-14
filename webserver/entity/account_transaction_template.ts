import { Entity, Column, OneToOne, ManyToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { JournalTemplate } from './journal_template';
import { Account } from './account';
import { DebitOrCredit, TransactionTemplateType } from '../constants';

@Entity()
export class AccountTransactionTemplate extends SharedEntityColumns {
    @ManyToOne( type => JournalTemplate, journalTemplates => journalTemplates.transactionTemplates )
    journalTemplate!: JournalTemplate

    @ManyToOne( type => Account, {eager: true} )
    account!: Account

    @Column( {
        default: TransactionTemplateType.Remainder
    })
    method!: TransactionTemplateType;

    @Column( {
        default: DebitOrCredit.Debit
    })
    sign!: DebitOrCredit;

    @Column( {type:"decimal", precision: 11, scale: 2, comment: "For method=P, this is the percentage; for method=R, it has no meaning"})
    amount: number = 0.00;

    public calculate( originalAmount: number, subtotal: number ): number {
        return this.method === TransactionTemplateType.Fixed ?
            this.sign * this.amount :
            this.method === TransactionTemplateType.Percentage ?
                this.sign * this.amount / 100 * originalAmount :
                this.sign * subtotal
        ;
    }
}
