import { DebitOrCredit, TransactionTemplateType } from '../constants';
import { IsEnum, Min, Max, ValidateIf } from "class-validator"

const INVALID_PERCENTAGE = "Amount may not be negative, use the sign for that.";

export class AccountTransactionTemplate  {

    accountId!: number

    @IsEnum( DebitOrCredit )
    sign!: DebitOrCredit;

    @ValidateIf( t => t.percentage === undefined )
    @Min( 0, { message: "Amount may not be negative, use the sign for that."} )
    fixed!: number;

    @ValidateIf( t => t.fixed === undefined )
    @Min(   1, { message: INVALID_PERCENTAGE } )
    @Max( 100, { message: INVALID_PERCENTAGE } )
    percentage!: number;

    public get method(): TransactionTemplateType {
        return this.accountId < 0 ?
            TransactionTemplateType.Bank :
            typeof this.fixed == "number" ?
                TransactionTemplateType.Fixed :
                typeof this.percentage == "number" ?
                    TransactionTemplateType.Percentage :
                    TransactionTemplateType.Remainder
        ;
    }

    public get amount() {
        return this.method == TransactionTemplateType.Fixed ?
            this.fixed :
            this.method == TransactionTemplateType.Percentage ?
                this.percentage :
                0
        ;
    }
}
