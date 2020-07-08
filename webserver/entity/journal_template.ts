import { Entity, Column, OneToMany, Transaction } from "typeorm";
import { SharedEntityColumns } from '../shared_enity_columns';
import { AccountTransactionTemplate } from './account_transaction_template';
import { MinLength } from 'class-validator';
import { CURRENCY_DIMENSIONS } from '../constants';

import { JournalEntry} from "../params/journal_entry";
import { AccountTransaction as AccountTransactionArgument} from "../params/account_transaction";
import { Account } from './account';

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

	public instantiate(forAmount: number, bankAccountId: number | null = null ) {
		const result = new JournalEntry();
		result.description = this.description;
		result.bookingDate = new Date();
		result.transactions = [];
		let accountId: number | null = null;
		let relativeSign = 1;

		let bankAccountTransaction: AccountTransactionTemplate | null = null;
		for ( let ix=0; bankAccountTransaction == null && ix < this.transactionTemplates.length; ix++ ){
			const accountTransactionTemplate = this.transactionTemplates[ ix ];
			if (accountTransactionTemplate.account == null){
				accountId = bankAccountId;
				relativeSign = Math.sign( forAmount );
			}
		}

		let subtotal = 0;
		for (const transactionTemplate of this.transactionTemplates ){
			const transaction = new AccountTransactionArgument();
			transaction.accountId = transactionTemplate.account == null ? accountId! : transactionTemplate.account.id;
			const calculated =  transactionTemplate.calculate( Math.abs(forAmount), subtotal, relativeSign );
			subtotal += calculated;
			const sign = Math.sign( calculated );
			if ( transactionTemplate.checkForSign && !isNihil( calculated ) && sign !== transactionTemplate.sign * relativeSign ){
				console.warn( `${result.description} has different sign for ${transactionTemplate.accountNumberAsText} (${calculated}).` );
			}
			transaction.amount = Math.abs( calculated );
			transaction.sign = sign;
			result.transactions.push( transaction );
		}
		if ( !isNihil(subtotal ) ) console.error( `${result.description} has value left ${subtotal}.` );

		return result;
	}
}

function isNihil( amount: number ){ return -0.005 < amount &&  amount < 0.005; }
