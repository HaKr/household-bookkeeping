import {Entity, Column, Index, ManyToOne, OneToMany, OneToOne, JoinColumn} from "typeorm";

import { SharedEntityColumns } from "../shared_enity_columns";
import { Group } from './group';
import { AccountTransaction } from './account_transaction';
import { AccountTransactionTemplate } from "./account_transaction_template";
import { SIZES } from '../constants';

@Entity()
export class Account extends SharedEntityColumns {

    @Column({length: 8, unique: true})
    number!: string;

    @Column({length: SIZES.NAME })
    name!: string;

    @ManyToOne( type => Group, group => group.accounts )
    group!: Group

    @OneToMany( type => AccountTransaction, accountTransaction => accountTransaction.account )
    transactions!: AccountTransaction[]

    @OneToMany( type => AccountTransactionTemplate, accountTransactionTemplate => accountTransactionTemplate.account )
    transactionTemplates!: AccountTransactionTemplate[]
}
