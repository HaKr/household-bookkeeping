import { QueryRunner, createConnection, Connection, Repository, EntityManager } from "typeorm";

import { AccountRepository } from '../repository/account_repository';
import { JournalTemplateRepository } from '../repository/journal_template_repository';

import { BankAccount } from '../entity/bank_account';


export abstract class FixtureRunner {
    private errors: string[] = [];

    protected transaction: EntityManager = null as any;
    protected queryRunner: QueryRunner = null as any;
    protected accountRepository: AccountRepository  = null as any;
    protected bankAccountRepository: Repository<BankAccount> = null as any;
    protected journalTemplateRepository: JournalTemplateRepository = null as any;
    
    protected abstract async insert(): Promise<any>;

    protected abstract async remove(): Promise<any>;

    protected abstract transactionStarted(): void;

    private createTransaction( connection: Connection ){
        this.queryRunner = connection.createQueryRunner();
        this.transaction = this.queryRunner.manager;
        this.accountRepository = this.transaction.getCustomRepository( AccountRepository );
        this.bankAccountRepository = this.transaction.getRepository( BankAccount );
        this.journalTemplateRepository = this.transaction.getCustomRepository( JournalTemplateRepository );

        this.transactionStarted();
    }

    private disconnect()
    {

    }

    protected notifyError( e: string ){
        this.errors.push( e );
    }

    protected get isOK() { return this.errors.length < 1; }

    protected async findAccountByNumber( number: string ){
        return this.accountRepository.findByNumber( number );
    }

    protected async findBankAccountByIban( iban: string ){
        return this.bankAccountRepository.findOne( {iban} );
    }

    protected async findTemplateByName( description: string ){
        return this.journalTemplateRepository.findOne( {description} );
    }

    protected ymdToDate( ymd: string ){
        const [ y, m, d ] = ymd.split("-");
        return new Date( Date.UTC( Number(y), Number(m)-1, Number(d) ) );
    }

    public run(){
        createConnection().then(async connection => {
            this.createTransaction( connection );
            
            // establish real database connection using our new query runner
            await this.queryRunner.connect();
        
            // lets now open a new transaction:
            await this.queryRunner.startTransaction();
        
            try {
        
                await this.remove( );
                const started = process.hrtime.bigint();
                await this.insert( ).catch( e => {console.error( e ); this.notifyError( "Fixture error" ); });
                const elapseded = started - process.hrtime.bigint();
                if (this.errors.length>0){ 
                    console.error( `Forcing rollback (${this.errors.length}).\n\t${this.errors.join("\n\t")}` );
                    await this.queryRunner.rollbackTransaction();
                } else await this.queryRunner.commitTransaction();
                
            } catch (err) {
                console.error( err );
                
                // since we have errors lets rollback changes we made
                await this.queryRunner.rollbackTransaction();
                
            } 
        
            await this.queryRunner.release();
            connection.close();
        }).catch( e => {
            console.error("DB connection error:", e );
        });        
    }
}

