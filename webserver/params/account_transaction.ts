import { DebitOrCredit } from '../constants';
import { IsEnum, Min } from "class-validator"
import { AccountIdMustExist } from '../validator/existing_account_id';

export class AccountTransaction  {


    @Min( 1 )
    accountId!: number

    @IsEnum( DebitOrCredit )
    sign!: DebitOrCredit;

    @Min( 0 )
    amount!: number;
}
