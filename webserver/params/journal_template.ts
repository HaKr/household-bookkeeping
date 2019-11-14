import { MinLength, IsDate, ValidateNested, ArrayMinSize, IsInt, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

import { AccountTransactionTemplate } from "./account_transaction template";

export class JournalTemplate  {
    
    @MinLength( 5 )
    description!: string;

    @IsInt()
    @ArrayMinSize( 1 )
    @ArrayMaxSize( 2 )
    @ValidateNested( { each: true } )
    validFor!: number[];

    @Type( () => AccountTransactionTemplate )
    @ArrayMinSize( 2 )
    @ValidateNested( {each: true } )
    transactionTemplates!: AccountTransactionTemplate[]

    private get validBetween(){
        const l = this.validFor[ 0 ];
        const r = this.validFor.length == 2 ? this.validFor[ 1 ] : l+0.01;
        return [ Math.min( l, r ), Math.max( l, r) ];
    }

    public get validMin(){ return this.validBetween[ 0 ]; }

    public get validMax(){ return this.validBetween[ 1 ]; }
}