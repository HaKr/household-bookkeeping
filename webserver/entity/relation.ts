import {Entity, Column, OneToMany } from "typeorm";

import { SIZES } from "../constants";

import { SharedEntityColumns } from "../shared_enity_columns";

import { RelationReference } from './relation_reference';

@Entity()
export class Relation extends SharedEntityColumns {

    @Column({length: SIZES.NAME, unique: true })
    name!: string;

    @Column( {length: SIZES.DESCRIPTION } )
    description!: string; 

    @OneToMany( type => RelationReference, RelationReference => RelationReference.relation )
    references!: RelationReference[]
}
