import {getManager} from "typeorm";

import { Request, Response } from 'express';
import { JsonController, Get, Post, Param } from 'routing-controllers';
// import { Logger } from '@overnightjs/logger';

import { SUCCESS, ERROR } from '../http-status-codes';

import { Group } from "../entity/group";
import { GroupBalance } from '../entity/group_balance';

@JsonController('/group[s]?')
export class GroupController {
    private groupRepository = getManager().getRepository(Group);
    private groupBalanceRepository = getManager().getRepository(GroupBalance);
    private treeRepository = getManager().getTreeRepository( Group );

    @Get()
    protected async getAll() {
        const groupTree = await this.treeRepository.findTrees();
        await this.getBalances( groupTree );
        return groupTree;
    }

    @Get("/:id")
    private getOne( @Param("id") id: number ) {
        return this.groupRepository.findOne( id, {relations: ["accounts"] } );
    }

    @Post()
    private async create(  req: Request, res: Response ){
        console.log( "Group::create" );
        console.dir( req.body, {depth: 4});
        return res.status( ERROR.NOT_IMPLEMENTED ).json({});
    }

    private async getBalances( groupList: Group[] ){
        let sum = 0
        for ( const group of groupList ){
            const id = group.id;
            const groupBalance = await this.groupBalanceRepository.findOne( {id} );
            const groupAmount = groupBalance instanceof GroupBalance ? parseFloat(groupBalance.amount) : 0;
            const amount = isNaN( groupAmount ) ? 0.0 : groupAmount;   
            const childSum = await this.getBalances( group.groups );
            group.amount = amount + childSum;
            sum += group.amount;
            //console.log( `[${group.id}]${group.number}-${group.name}: ${group.sign} * ${group.amount}, ${childSum}, (${sum})` )
        }
        return sum;
    }
}
