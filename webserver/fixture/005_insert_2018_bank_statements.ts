import * as csvtojson from "csvtojson";
import * as fs from "fs";

import { MoreThan, Repository } from "typeorm";
import { DebitOrCredit } from '../constants';

import { FixtureRunner } from "./fixture_runner";

import { JournalEntryRepository } from '../repository/journal_entry_repository';

import { BankTransaction } from "../entity/bank_transaction";
import { JournalTemplate } from '../entity/journal_template';
import { Reconciliation } from '../entity/reconciliation';
import { ReconciliationPeriod } from '../entity/reconciliation_period';
import { ReconciliationMatch } from '../entity/reconciliation_match';
import { Relation } from "../entity/relation";
import { RelationReference } from "../entity/relation_reference";

import { JournalEntry } from '../entity/journal_entry';
import { AccountTransaction } from '../entity/account_transaction';

interface INGCSV {
    Datum: string,
    'Naam / Omschrijving': string,
    Rekening: string,
    Tegenrekening: string,
    Code: string,
    'Af Bij': string,
    'Bedrag (EUR)': string,
    MutatieSoort: string,
    Mededelingen: string
}

interface BankTransactionInfo {
    iban: string,
    currencyDate: Date;
    relationAccount: string;
    relationName: string;
    sign: DebitOrCredit;
    amount: number;
    description: string;
}

const interestingKeywords = [
    'Naam',
    'Omschrijving',
    'IBAN',
    // 'Datum/Tijd',
    // 'Pasvolgnr',
    // 'Transactie',
    // 'Term',
    // 'Kenmerk',
    // 'Valuta',
    // 'Koers',
    // 'Opslag',
    // 'Machtiging ID',
    // 'Incassant ID',
    // 'Klantnr',
    // 'partij',
    'Check',
    // 'Kosten',
    // 'LOKERSE',
    // 'Schadenr',
    // 'kenmerk',
    // 'Reden',
    // 'Order',
    // 'BestelNr',
    "Valutadatum"  
];

const re=/([a-z\/A-Z-]{4,15}(\s[a-z\/A-Z-]{2})?):\s*(.*)/;

function keywordExtractor( elt: string, index: number, all: string[] ){
    if ( index % 2 > 0 ) return null;
    const keyWord = elt[0].toUpperCase() + elt.substring(1);

    return { [ keyWord ]:  all[ index+1 ].trim() }; 
}

const keywordSet = new Set<string>();

function parseMed( med: string, keywords: {[index: string]: string } ) {
    let res = med;
    let lastKey: string | null =    null;

    while (re.test(res)){
        const m = res.match( re )!;

        if ( m.index! > 0) {
            const keyName = lastKey !== null ? lastKey : "Omschrijving";
            if (!keywordSet.has( keyName ) ) keywordSet.add( keyName );

            const keyValue = m.input!.substring( 0, m.index ).trim();

            if ( keywords.hasOwnProperty( keyName ) ) keywords[ keyName ] += " " + keyValue;
            else keywords[ keyName ] = keyValue;  
        }
        
        lastKey = m[1];
        res = m[3];

    }
    
    keywords[ lastKey !== null ? lastKey : "Omschrijving" ] = res;

    let oms = keywords.Omschrijving || "" ;
    for ( const keyword in keywords ){
        if ( interestingKeywords.indexOf( keyword ) < 0 ){
            oms += ` ${keyword}: ${keywords[ keyword ]}`
        }
    }

    keywords.Omschrijving = oms.trim();

    return keywords;
}

function INGDate( ingDate: string ){
    return new Date( Date.UTC(
        Number( ingDate.substring( 0, 4 ) ),
        Number( ingDate.substring( 4, 6 ) ) - 1,
        Number( ingDate.substring( 6, 8 ) )
        )
    );
}

function INGAmount( ingAmount: string ){
    const [ euro, cent ] = ingAmount.split(",").map( v => Number( v ) );
    return euro + cent/100;
}

function compareBankTransactionsByDate( refA: BankTransactionInfo, refB: BankTransactionInfo ){
    return refA.currencyDate.getTime() - refB.currencyDate.getTime();
}

class InsertBankAccountReconciliation extends FixtureRunner {
    protected reconciliationRepository: Repository< Reconciliation > = null as any;
    protected reconciliationPeriodRepository: Repository< ReconciliationPeriod > = null as any;
    protected reconciliationMatchRepository: Repository< ReconciliationMatch > = null as any;
    protected relationRepository: Repository<Relation> = null as any;
    protected relationReferencesRepository: Repository<RelationReference> = null as any;
    protected bankTransactionRepository: Repository<BankTransaction> = null as any;
    protected journalEntryRepository: JournalEntryRepository = null as any;
    protected accountTransactionRepository: Repository<AccountTransaction> = null as any;
    private readonly messages = {
        references: new Set<string>(),
        reconciliations: new Set<string>(),
        periods: new Set<string>(),
        matches: new Set<string>()

    };
    
    protected transactionStarted(){
        this.relationRepository = this.transaction.getRepository( Relation );
        this.relationReferencesRepository = this.transaction.getRepository( RelationReference );
        this.reconciliationRepository = this.transaction.getRepository( Reconciliation );
        this.reconciliationPeriodRepository = this.transaction.getRepository( ReconciliationPeriod );
        this.reconciliationMatchRepository = this.transaction.getRepository( ReconciliationMatch );
        this.bankTransactionRepository = this.transaction.getRepository( BankTransaction );
        this.journalEntryRepository = this.transaction.getCustomRepository( JournalEntryRepository );
        this.accountTransactionRepository = this.transaction.getRepository( AccountTransaction );
    }

    private notify( set: Set<string>, message: string ){
        set.add( message );
    }

    protected async parse( ingStatement: INGCSV[] ){
        const bankAccounts = new Map<string,BankTransactionInfo[]>();
        
        for ( const ingTransaction of ingStatement ){
            const cleanedRec = parseMed( ingTransaction.Mededelingen, {} );
            const med = cleanedRec.Omschrijving!;
            const naamOmschrijving = ingTransaction["Naam / Omschrijving"].trim();

            const bankTransaction: BankTransactionInfo = {
                amount: INGAmount( ingTransaction["Bedrag (EUR)"] ),
                currencyDate: INGDate( ingTransaction.Datum ),
                description: cleanedRec.Omschrijving!,
                iban: ingTransaction.Rekening,
                relationName: cleanedRec.Naam || naamOmschrijving,
                relationAccount: cleanedRec.IBAN || ingTransaction.Tegenrekening,
                sign: ingTransaction["Af Bij"] === "Af" ? DebitOrCredit.Credit : DebitOrCredit.Debit
            };
            
            if (! bankAccounts.has( bankTransaction.iban ) ){
                bankAccounts.set( bankTransaction.iban, [] );
            }
            const bankAccountList = bankAccounts.get( bankTransaction.iban )!;
            bankAccountList.push( bankTransaction );
        }

        for ( const bankAccountNumber of bankAccounts.keys() ){
            const bankAccountList = bankAccounts.get( bankAccountNumber )!;
            const bankAccount = await this.findBankAccountByIban( bankAccountNumber );
            
            for (const bankTransactionInfo of bankAccountList.sort( compareBankTransactionsByDate ) ){
                let journalEntry: JournalEntry | null = null;
                const transactionAmount = bankTransactionInfo.sign * bankTransactionInfo.amount;
                const reference = bankTransactionInfo.relationAccount.length < 1 ? bankTransactionInfo.relationName : bankTransactionInfo.relationAccount;
                if ( reference.trim().length < 1 ) console.log( "Reference? ", bankTransactionInfo.relationAccount.length,  bankTransactionInfo );
                const relationReference = await this.relationReferencesRepository.findOne( {  relations: ["relation"], where: { reference } } );
                if ( relationReference !== undefined ){
                    const relation = relationReference.relation;
                    const reconciliation = await this.reconciliationRepository.findOne( { relation, bankAccount} );
                    if ( reconciliation !== undefined ){
                        const period = await this.reconciliationPeriodRepository.findOne( { where: `reconciliationId = ${reconciliation.id} AND '${bankTransactionInfo.currencyDate.toISOString()}' BETWEEN validFrom AND validUntil`} );
                        if ( period != undefined){
                            const matches = await this.reconciliationMatchRepository.find( {relations: ["journalTemplate", "journalTemplate.transactionTemplates", "journalTemplate.transactionTemplates.account"], where: { reconciliationPeriod: period }});
                            let journalTemplate: JournalTemplate | null = null;
                            for ( const match of matches ){
                                match.amountFrom = parseFloat( match.amountFrom.toString() );
                                match.amountUntil= parseFloat( match.amountUntil.toString() );
                                let matches = journalTemplate === null && match.amountFrom <= transactionAmount && transactionAmount < match.amountUntil;
                                if (matches && match.trigger && match.trigger.length > 0 ){
                                    matches = bankTransactionInfo.description.indexOf( match.trigger ) >= 0;
                                }
                                if (matches) journalTemplate = match.journalTemplate;
                            }
                            if (journalTemplate !== null){
                                const result = journalTemplate.instantiate(transactionAmount, bankAccount!.id );
                                const addResult = await this.journalEntryRepository.addWithTransactions( result, this.queryRunner );
                                journalEntry = addResult.record!;
                            } else this.notify( this.messages.matches, `No match for ${bankAccount!.iban} ${relation!.description} ${transactionAmount}` );
                        } else this.notify( this.messages.periods, `No period for ${bankAccount!.iban} ${relation!.description} ${bankTransactionInfo.currencyDate.toLocaleDateString()}` );
                    } else this.notify( this.messages.reconciliations, `${bankAccount!.iban}, ${relation!.description}  combo not found`);
                } else this.notify( this.messages.references, `${reference} not yet known.` );
            }
        }
        console.dir( this.messages, { depth: 8 } );
        this.notifyError( "Still not sure whether to keep the results" );
    
    }
    

    protected async insert() {
        const csv = await csvtojson({trim: true})
            .fromFile("master\ data/upload/Alle_rekeningen_01-01-2018_31-12-2018.csv");
        
        return this.parse( csv );
    }

    
    protected async remove() {
        await this.bankTransactionRepository.delete( {id: MoreThan( 0 ) } );
        await this.accountTransactionRepository.delete( "journalEntryId > 1" );
        return this.journalEntryRepository.delete( {id: MoreThan( 1 )} );
    }
}

new InsertBankAccountReconciliation().run();
