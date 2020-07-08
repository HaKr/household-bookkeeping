import {EntityRepository, Repository} from "typeorm";
import { Account } from '../entity/account';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {

    findByNumber( number: string ) {
        return this.findOne({ number }, { relations: [ "transactions" ] });
    }
}
