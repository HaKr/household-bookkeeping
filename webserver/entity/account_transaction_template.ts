import { Entity, Column, OneToOne, ManyToOne } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { JournalTemplate } from './journal_template';
import { Account } from './account';
import { DebitOrCredit, TransactionTemplateType } from '../constants';

@Entity()
export class AccountTransactionTemplate extends SharedEntityColumns {
    @ManyToOne( type => JournalTemplate, journalTemplates => journalTemplates.transactionTemplates )
    journalTemplate!: JournalTemplate

    @ManyToOne( type => Account, { nullable: true } )
    account: Account | null = null;

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

    public get accountNumberAsText() { return this.account == null ? "0" : this.account.number; }
    public get checkForSign() { return this.method != TransactionTemplateType.Bank; }

    public get calculateMethod(){
        return this.method == TransactionTemplateType.Bank ?
        TransactionTemplateType.Percentage :
        this.method
    }
    
    public get calculateAmount(){
        return this.method == TransactionTemplateType.Bank ?
        100 :
        this.amount
    }
    private get signedAmount(){
        return this.method === TransactionTemplateType.Fixed || this.method === TransactionTemplateType.Percentage ?
            this.sign * this.amount :
                this.method === TransactionTemplateType.Bank
                    ? this.sign * 100
                    : 0
        ;
    }
    
    public calculate( originalAmount: number, subtotal: number, relativeSign: number ): number
    {
        const raw = 
        this.method === TransactionTemplateType.Remainder
            ? -subtotal
            : this.method === TransactionTemplateType.Fixed ?
                this.signedAmount :
                relativeSign * this.signedAmount * originalAmount / 100                
        ;
        return Math.round( raw * 100 ) / 100;
    }
}
