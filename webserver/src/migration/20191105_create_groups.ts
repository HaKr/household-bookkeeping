import { MigrationInterface, QueryRunner } from "typeorm";

import { Group } from "../entity/group";

export class GroupFixtures1572971720506 implements MigrationInterface{
    name = "Group fixtures 1572971720506"
    
    async up(queryRunner: QueryRunner) {
        const groupRepository = queryRunner.manager.getRepository( Group );

        const balance = new Group();
        balance.number = "top";
        balance.name = "Balans";
        await groupRepository.save( balance );
 
        const incomeStatement = new Group();
        incomeStatement.number = "bottom";
        incomeStatement.name = "Uitgaven en Inkomsten";
        await groupRepository.save( incomeStatement );
 
        const assets = new Group();
        assets.number = "TL";
        assets.name = "Activa";
        assets.parent = balance;
        await groupRepository.save( assets );
 
        const liabilities = new Group();
        liabilities.number = "TR";
        liabilities.name = "Passiva";
        liabilities.parent = balance;
        await groupRepository.save( liabilities );
    }

    down(queryRunner: QueryRunner): Promise<any> {
        throw new Error("Method not implemented.");
    }

    
}
