import {getManager} from "typeorm";

import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
// import { Logger } from '@overnightjs/logger';

import { SUCCESS, ERROR } from '../http-status-codes';

import { Group } from "../entity/group";
import { GroupBalance } from '../entity/group_balance';
import { Logger } from '@overnightjs/logger';

@Controller('group[s]?')
export class GroupController {
    private groupRepository = getManager().getRepository(Group);
    private groupBalanceRepository = getManager().getRepository(GroupBalance);
    private treeRepository = getManager().getTreeRepository( Group );

    @Get()
    private async getAll(_req: Request, res: Response) {
        const groupTree = await this.treeRepository.findTrees();
        await this.getBalances( groupTree );
        return res.status( SUCCESS.OK ).json( groupTree );
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
            Logger.Info( `[${group.id}]${group.number}-${group.name}: ${group.sign} * ${group.amount}, ${childSum}, (${sum})` )
        }
        return sum;
    }
}
