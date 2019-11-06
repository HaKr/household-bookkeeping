import {getManager} from "typeorm";

import { Request, Response } from 'express';
import { Controller, Get, Post } from '@overnightjs/core';
// import { Logger } from '@overnightjs/logger';

import { Group } from "../entity/group";
import { SUCCESS, ERROR } from '../http-status-codes';

@Controller('group[s]?')
export class GroupController {
    private groupRepository = getManager().getRepository(Group);
    private treeRepository = getManager().getTreeRepository( Group );

    @Get("")
    private async getAll(_req: Request, res: Response) {
        const groupTree = await this.treeRepository.findTrees();
        return res.status( SUCCESS.OK ).json( groupTree );
    }

    @Post()
    private async create(  req: Request, res: Response ){
        console.log( "Group::create" );
        console.dir( req.body, {depth: 4});
        return res.status( ERROR.NOT_IMPLEMENTED ).json({});
    }
}
