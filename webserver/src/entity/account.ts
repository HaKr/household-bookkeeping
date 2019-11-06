import {Entity, Column, Index} from "typeorm";

import { BaseEntity } from "../base_entity";

@Entity()
export class Account extends BaseEntity {

    @Column({length: 8, unique: true})
    number!: string;

    @Column({length: 60})
    name!: string;

}
