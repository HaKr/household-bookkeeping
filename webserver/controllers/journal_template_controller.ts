import { getManager } from "typeorm";

import { JsonController, Get, Post, Param, BodyParam, Res, QueryParam } from 'routing-controllers';
import { Response } from 'express';

import { SUCCESS } from '../http-status-codes';

import { JournalTemplate as JournalTemplateArgument } from '../params/journal_template';

import { JournalTemplateRepository } from '../repository/journal_template_repository';

@JsonController('/template')
export class JournalTemplateController {
    private journalTemplateRepository = getManager().getCustomRepository( JournalTemplateRepository );
    
    @Get()
    protected getAll(){
        return this.journalTemplateRepository.find()
    }

    @Get("/:id")
    protected async getOne(
        @Param("id") id: number,
        @QueryParam("for") forAmount: number,
        @Res() res: Response
    ) {
        const journalTemplate = await this.journalTemplateRepository.findOne( id, { relations: ["transactionTemplates"]} );
        if (journalTemplate === undefined) return res.status( SUCCESS.OK ).json( { errors: "Could not find template "+id});
        if (forAmount === undefined) return res.status( SUCCESS.OK ).json( { journalTemplate } );
        else {
            if (journalTemplate.isValidFor( forAmount )){
                return res.status( SUCCESS.OK ).json( {"journal": journalTemplate.instantiate( forAmount ) } );

            } else return res.status( SUCCESS.OK ).json( {errors: `Template ${journalTemplate.description} is only valid for amounts between ${journalTemplate.validMin} and ${journalTemplate.validMax}` } )
        }
    }

    @Post( "" )
    protected async create( 
        @BodyParam("template", { validate: true }) journalEntryArgument: JournalTemplateArgument,
        @Res() res: Response
    ){ 
        const result = await this.journalTemplateRepository.addWithTransactions( journalEntryArgument );
        return res.status(result.errors ? SUCCESS.OK : SUCCESS.CREATED ).json( result );
    }

}
