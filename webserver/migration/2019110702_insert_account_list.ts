import * as csvtojson from "csvtojson";

import { Logger } from '@overnightjs/logger';
import { MigrationInterface, QueryRunner, Transaction, TransactionRepository, Repository } from "typeorm";

import { GroupRepository } from '../repository/group_repository';

import { Account } from '../entity/account';

type CsvStructure = Record<"Naam" | "Nr" | "SoortNr", string>;

export class InsertGroupGrid implements MigrationInterface{
    name = "Insert account list 1573134558986"
    
    async up(queryRunner: QueryRunner) {
        let failed = 0;
        const groupRepository = queryRunner.manager.getCustomRepository( GroupRepository);
        const gridData: CsvStructure[] = await csvtojson().fromFile("master\ data/account_list.csv");
        for ( const gridLine of gridData ) {
            const newAccount = new Account()
            newAccount.number = gridLine.Nr;
            newAccount.name = gridLine.Naam;
            const parentGroup = (await groupRepository.findByNumber( gridLine.SoortNr ));
            if (parentGroup) {
                newAccount.group = parentGroup;
                await queryRunner.manager.save( newAccount );    
            } else {
                Logger.Err( `Account: Could not find group ${gridLine.SoortNr} for account ${gridLine.Nr}: ${gridLine.Naam}.` );
                failed += 1;
            }
        }
        if ( failed>0 ) throw new Error( `Forcing rollback (${failed})...` );

    }

    async down(queryRunner: QueryRunner): Promise<any> {
        return queryRunner.query( "DELETE FROM account WHERE id > 0" );
    }

}
