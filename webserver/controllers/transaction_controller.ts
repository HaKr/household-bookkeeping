import {getManager, getConnection} from "typeorm";

import { JsonController, Get, Post, Param, BodyParam, Res, BadRequestError } from 'routing-controllers';

import { AccountTransaction } from '../entity/account_transaction';

@JsonController('/transaction[s]?')
export class JournalTransactionController {
    private accountTransactionRepositry = getManager().getRepository( AccountTransaction );

    
    @Get()
    private getAll(){
        return this.accountTransactionRepositry.find({relations: ["account", "journalEntry"]});
    }

    @Get("/:id")
    private getOne( @Param("id") id: number ) {
        return this.accountTransactionRepositry.findOne( id, {relations: ["account", "journalEntry"]});
    }

}
