import "reflect-metadata";

import {createConnection, Connection, EntityManager, QueryFailedError} from "typeorm";

import { DebitOrCredit } from "../constants";

import { Group } from "../entity/group";
import { GroupRepository } from "../repository/group_repository";

import { Account } from "../entity/account";

interface MasterGroupData {
    number: string, name: string, parent?: string, sign?: DebitOrCredit
}

const masterGroupData:MasterGroupData[] = [
    { number: "B", name: "Balans" },
    { number: "E", name: "Uitgaven en Inkomsten" },
    { number: "BL", name: "Activa", parent: "B", sign: DebitOrCredit.Debit },
    { number: "BR", name: "Passiva", parent: "B", sign: DebitOrCredit.Credit  },
    { number: "EL", name: "Uitgaven", parent: "E", sign: DebitOrCredit.Debit },
    { number: "ER", name: "Inkomsten", parent: "E", sign: DebitOrCredit.Credit  }
];

async function test( manager: EntityManager ){
    const account1 = new Account();
    account1.number = "4351";
    account1.name = "Account 1";
    await manager.save( account1 );
    console.log( `Created account ${account1.id}`);

    const account2 = new Account();
    account2.number = "4361";
    account2.name = "Account 2";
    await manager.save( account2 );
    console.info( `Created account ${account2.id}`);

    const group1 = new Group()
    group1.number = "B";
    group1.name = "Group B";
    await manager.save( group1 );
    console.info( `Created account ${JSON.stringify(group1)}`);

    const group2 = new Group()
    group2.number = "B1";
    group2.name = "Group B.1";
    group2.parent = group1;
    await manager.save( group2 );
    console.info( `Created account ${JSON.stringify(group2)}`);

    return true;
}

async function insertSchema( manager: EntityManager ){
    const groupsByNumber = new Map<string,Group>();
    let failed = false;

    for ( const masterGroup of masterGroupData ){
        let doSave = true;

        const newGroup = new Group();
        newGroup.number = masterGroup.number;
        newGroup.name = masterGroup.name;
        groupsByNumber.set( newGroup.number, newGroup );
        if ( masterGroup.parent )
        {
            if ( groupsByNumber.has( masterGroup.parent) ) {
                const parent = groupsByNumber.get( masterGroup.parent )!;
                console.log(`Assign parent ${parent.number}(${parent.id}) to ${newGroup.number}(${newGroup.id})`);
                newGroup.parent = parent;
                newGroup.sign = parent.sign;
            } else {
                console.error( `Parent "${masterGroup.parent}" was not found for ${masterGroup.number}, but is obligatory.` );
                doSave = false;
                failed = true;
            }
        }
        if (doSave){
                await manager.save( newGroup );
                console.error( `Created: ${newGroup.number}(${newGroup.id})`);
        }
    }

    return !failed;
}
createConnection().then(async connection => {
    const queryRunner = connection.createQueryRunner();

    // establish real database connection using our new query runner
    await queryRunner.connect();

    // lets now open a new transaction:
    await queryRunner.startTransaction();

    try {

        if ( await insertSchema( queryRunner.manager ) ) {
            await queryRunner.commitTransaction();
        } else {
            await queryRunner.rollbackTransaction();
        }
        
    } catch (err) {
        
        // since we have errors lets rollback changes we made
        await queryRunner.rollbackTransaction();
        
    } finally {
        
        // you need to release query runner which is manually created:
        await queryRunner.release();
    }

    connection.close();
}).catch( e => {
    console.error("Could not start model server", e );
});
