import { MinLength, IsDate, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

import { AccountTransaction } from "./account_transaction";

export class JournalEntry  {
    
    @IsDate()
    @Type( () => Date )
    bookingDate!: Date;

    @MinLength( 5 )
    description!: string;

    @Type( () => AccountTransaction )
    @ArrayMinSize( 2 )
    @ValidateNested( {each: true } )
    transactions!: AccountTransaction[]
}