import { MoreThan, Repository } from "typeorm";
import { FixtureRunner } from "./fixture_runner";

import { BankAccount } from '../entity/bank_account';

const masterBankAccountArguments = [
    { 
        iban: "NL10INGB0008110010",
        name: "Mw C Brokking",
        accountNr: "1101"
    },
    { 
        iban: "NL71INGB0004229106",
        name: "Hr JJ de Kroon",
        accountNr: "1201"
    },
    { 
        iban: "NL03INGB0653338325",
        name: "Mw C Brokking, Hr JJ de Kroon",
        accountNr: "1301"
    },
    { 
        iban: "NL02INGB0664459102",
        name: "Hr JJ de Kroon, Mw C Brokking",
        accountNr: "1302"
    }
];

class InsertBankAccount extends FixtureRunner {
    protected bankAccountRepository: Repository<BankAccount> = null as any;

    protected transactionStarted() {
        this.bankAccountRepository = this.transaction.getRepository( BankAccount );
    }

    protected async insert()
    {
        for ( const bankAccountArgument of masterBankAccountArguments) {
            const account = await this.findAccountByNumber( bankAccountArgument.accountNr );
            const bankAccount = new BankAccount();
            bankAccount.account = account!;
            bankAccount.iban = bankAccountArgument.iban;
            bankAccount.name = bankAccountArgument.name;
            await this.bankAccountRepository.insert( bankAccount );
        }
    }    
    
    protected async remove()
    {
        return this.bankAccountRepository.delete( {id: MoreThan( 0 ) } )
    }
}

new InsertBankAccount().run();
