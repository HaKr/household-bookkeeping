import { Entity, Column, ManyToOne } from "typeorm";

import { SIZES } from "../constants";

import { SharedEntityColumns } from "../shared_enity_columns";

import { Relation } from "./relation"

@Entity()
export class RelationReference extends SharedEntityColumns {

    @Column({length: SIZES.REFERENCE, unique: true })
    reference!: string;

    @ManyToOne( type => Relation, relation => relation.references )
    relation!: Relation[]
}
