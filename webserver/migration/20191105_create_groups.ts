import { MigrationInterface, QueryRunner, Transaction, TransactionRepository, Repository } from "typeorm";
import { DebitOrCredit } from "../constants";

import { Group } from "../entity/group";

interface MasterGroupData {
    number: string, name: string, parent?: string, sign?: DebitOrCredit
}

const masterGroupData:MasterGroupData[] = [
    { number: "B", name: "Balans" },
    { number: "E", name: "Uitgaven en Inkomsten" },
    { number: "BL", name: "Financiële middelen", parent: "B", sign: DebitOrCredit.Debit },
    { number: "BR", name: "Reserveringen", parent: "B", sign: DebitOrCredit.Credit  },
    { number: "EL", name: "Uitgaven", parent: "E", sign: DebitOrCredit.Debit },
    { number: "ER", name: "Inkomsten", parent: "E", sign: DebitOrCredit.Credit  }
]

export class GroupFixtures1572971720506 implements MigrationInterface{
    name = "Group fixtures 1572971720506"
    
    async up(queryRunner: QueryRunner) {

        const groupsByNumber = new Map<string,Group>();

        for ( const masterGroup of masterGroupData ) {
            let doSave = true;

            const newGroup = new Group();
            newGroup.number = masterGroup.number;
            newGroup.name = masterGroup.name;
            groupsByNumber.set( newGroup.number, newGroup );
            if ( masterGroup.parent )
            {
                newGroup.category = masterGroup.parent;
                if ( groupsByNumber.has( masterGroup.parent) ) {
                    const parent = groupsByNumber.get( masterGroup.parent )!;
                    newGroup.parent = parent;
                    newGroup.sign = masterGroup.sign!;
                } else {
                    console.error( `Parent "${masterGroup.parent}" was not found for ${masterGroup.number}, but is obligatory.` );
                    doSave = false;
                }
            }
            if (doSave){
                 await queryRunner.manager.save( newGroup );
            }
        }
    }

    down(queryRunner: QueryRunner): Promise<any> {
        return queryRunner.query( "DELETE FROM ledger.group WHERE group.id>0")
    }

}
