import { getManager } from 'typeorm';

import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from "class-validator";

import { AccountTransaction } from '../entity/account_transaction';

@ValidatorConstraint({ async: true })
export class AccountIdChecker implements ValidatorConstraintInterface {
    private accountRepositry = getManager().getRepository( AccountTransaction );
    validate( at: any, args: ValidationArguments) {
        console.log( "transaction parameter" )
        console.dir( at, {depth: 6});
        return false;
        // return this.accountRepositry.findOne( id ).then( accountTransaction => {
        //     return accountTransaction instanceof AccountTransaction;
        // });
    }
 
}
 
export function AccountIdMustExist(validationOptions?: ValidationOptions) {
   return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AccountIdChecker
        });
   };
}