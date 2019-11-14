import {getManager, getConnection} from "typeorm";

import { JsonController, Get, Post, Param, BodyParam, Res, BadRequestError } from 'routing-controllers';
import { Response } from 'express';

import { SUCCESS } from '../http-status-codes';

import { JournalEntry as JournalEntryArgument } from '../params/journal_entry';

import { JournalEntryRepository } from '../repository/journal_entry_repository';

@JsonController('/journal')
export class JournalController {
    private journalRepository = getManager().getCustomRepository( JournalEntryRepository );
    
    @Get()
    private getAll(){
        return this.journalRepository.find({relations: ["transactions"]})
    }

    @Get("/:id")
    private getOne( @Param("id") id: number ) {
        return this.journalRepository.findOne( id, {relations: ["transactions"]} );
    }

    // private async create( @Body() journal: any ){
    @Post( "" )
    private async create( 
        @BodyParam("journal", { validate: true }) journalEntryArgument: JournalEntryArgument,
        @Res() res: Response
    ){ 
        const result = await this.journalRepository.addWithTransactions( journalEntryArgument );
        return res.status(result.errors ? SUCCESS.OK : SUCCESS.CREATED ).json( result );
    }

}
