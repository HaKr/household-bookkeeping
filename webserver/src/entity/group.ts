import {Entity, Column, Index, Tree, TreeChildren, TreeParent} from "typeorm";

import { BaseEntity } from "../base_entity";

@Entity()
@Tree("nested-set")
export class Group extends BaseEntity {

    @Column({length: 8, unique: true})
    number!: string;

    @Column({length: 60})
    name!: string;

    @TreeParent()
    parent!: Group;

    @TreeChildren()
    groups!: Group[];

}
