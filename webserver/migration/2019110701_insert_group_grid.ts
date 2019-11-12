import * as csvtojson from "csvtojson";

import { MigrationInterface, QueryRunner, Transaction, TransactionRepository, Repository } from "typeorm";

import { GroupRepository } from '../repository/group_repository';
import { Group } from '../entity/group';

type CsvStructure = Record<"Naam" | "Nr" | "Parent", string>;

export class InsertGroupGrid implements MigrationInterface{
    name = "Insert group grid 1573134558885"
    
    async up(queryRunner: QueryRunner) {
        let failed = 0;
        const groupRepository = queryRunner.manager.getCustomRepository( GroupRepository);
        const gridData: CsvStructure[] = await csvtojson().fromFile("master\ data/group_grid.csv");
        for ( const gridLine of gridData ) {
            const newGroup = new Group()
            newGroup.number = gridLine.Nr;
            newGroup.name = gridLine.Naam;
            const groupParent = (await groupRepository.findByNumber( gridLine.Parent ));
            if (groupParent) {
                newGroup.parent = groupParent;
                newGroup.category = groupParent.category;
                newGroup.sign = groupParent.sign;
                await queryRunner.manager.save( newGroup );
            } else {
                console.error( `Group: Could not find parent ${gridLine.Parent} for group ${gridLine.Nr}: ${gridLine.Naam}.\n\t${JSON.stringify(gridLine)}` );
                
                failed += 1;
            }
        }
        if ( failed>0 ) throw new Error( `Forcing rollback (${failed})...` );

    }

    async down(queryRunner: QueryRunner): Promise<any> {
        return queryRunner.query( "DELETE FROM group WHERE number NOT IN ('B', 'E', 'BL', 'BR', 'EL', 'ER' )" );
    }
}
