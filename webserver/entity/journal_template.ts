import { Entity, Column, OneToMany, Transaction } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { AccountTransactionTemplate } from './account_transaction_template';
import { MinLength } from 'class-validator';
import { CURRENCY_DIMENSIONS } from '../constants';

import { JournalEntry} from "../params/journal_entry";
import { AccountTransaction as AccountTransactionArgument} from "../params/account_transaction";
import { transcode } from 'buffer';

@Entity()
export class JournalTemplate extends SharedEntityColumns {

    @Column( CURRENCY_DIMENSIONS )
    validMin!: number;

    @Column( CURRENCY_DIMENSIONS )
    validMax!: number;

    @MinLength( 5 )
    @Column()
    description!: string;

    @OneToMany( type => AccountTransactionTemplate, accountTransaction => accountTransaction.journalTemplate )
    transactionTemplates!: AccountTransactionTemplate[];

    public isValidFor( amount: number ){
        return this.validMin <= amount && amount < this.validMax;
    }

    public instantiate(forAmount: number) {
        const result = new JournalEntry();
        result.description = this.description;
        result.bookingDate = new Date();
        result.transactions = [];

        let subtotal = 0;
        for (const transactionTemplate of this.transactionTemplates ){
            const transaction = new AccountTransactionArgument();
            transaction.accountId = transactionTemplate.account.id;
            const calculated =  transactionTemplate.calculate( Math.abs(forAmount), subtotal );
            subtotal += calculated;
            const sign = Math.sign( calculated );
            if ( sign !== transactionTemplate.sign ) console.warn( `${result.description} has different sign for ${transactionTemplate.account.number} (${calculated}).` );
            transaction.amount = Math.abs( calculated );
            transaction.sign = sign;
            result.transactions.push( transaction );
        }
        if ( subtotal !== 0 ) console.error( `${result.description} has value left ${subtotal}.` );

        return result;
    }
}
