import {Entity, Column, Index, Tree, TreeChildren, TreeParent, OneToMany} from "typeorm";

import { SharedEntityColumns } from "../shared_enity_columns";
import { DebitOrCredit, SIZES } from '../constants';
import { Account } from './account';

@Entity()
@Tree("nested-set")
export class Group extends SharedEntityColumns {

    @Column({length: 8, unique: true})
    number!: string;

    @Column({length: SIZES.NAME })
    name!: string;

    @Column({ 
        comment: "1 means on the debit side of reports, -1 on credit",
        // enum: DebitOrCredit,
        default: DebitOrCredit.Debit
    })
    sign!: DebitOrCredit

    @TreeParent()
    parent: Group | null = null;

    @Column( { length: 8, nullable: true } )
    category!: string;

    @TreeChildren()
    groups!: Group[];

    @OneToMany( type => Account, account => account.group )
    accounts!: Account[]

    amount: number = 0.00;
}
