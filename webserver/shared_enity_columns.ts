import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn } from "typeorm";

export abstract class SharedEntityColumns {
    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @VersionColumn()
    version!: number;
}