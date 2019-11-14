import { DebitOrCredit } from '../constants';
import { IsEnum, Min } from "class-validator"

export class AccountTransaction  {


    @Min( 1 )
    accountId!: number

    @IsEnum( DebitOrCredit )
    sign!: DebitOrCredit;

    @Min( 0 )
    amount!: number;
}
