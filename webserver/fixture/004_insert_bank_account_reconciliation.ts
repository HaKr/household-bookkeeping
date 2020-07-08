import { MoreThan, Repository } from "typeorm";

import { FixtureRunner } from "./fixture_runner";

import { Relation } from "../entity/relation";
import { RelationReference } from "../entity/relation_reference";
import { BankAccount } from '../entity/bank_account';
import { Reconciliation } from '../entity/reconciliation';
import { ReconciliationPeriod } from '../entity/reconciliation_period';
import { ReconciliationMatch } from '../entity/reconciliation_match';

import { AmountRange, AmountRangeInfo } from "../params/amount_range";

import * as json from "../master data/relations_with_references.json";

interface ReconciliationMatchInfo {
    trigger?: string;
    validFor?: AmountRangeInfo; 
    templateName: string;
}

interface ReconciliationInfo {
    validFrom: string,
    validUntil: string,
    matches: ReconciliationMatchInfo[]
}

interface ConnectionInfo {
    IBAN: string;
    reconciliation?: ReconciliationInfo[];
    templateName?: string;
}

interface BankConnection {
    name: string;
    description: string;
    connections: ConnectionInfo[];
    references: string[];
}


class InsertBankAccountReconciliation extends FixtureRunner {
    protected reconciliationRepository: Repository< Reconciliation > = null as any;
    protected reconciliationPeriodRepository: Repository< ReconciliationPeriod > = null as any;
    protected reconciliationMatchRepository: Repository< ReconciliationMatch > = null as any;
    protected relationRepository: Repository<Relation> = null as any;
    protected relationReferencesRepository: Repository<RelationReference> = null as any;

    protected transactionStarted(){
        this.relationRepository = this.transaction.getRepository( Relation );
        this.relationReferencesRepository = this.transaction.getRepository( RelationReference );
        this.reconciliationRepository = this.transaction.getRepository( Reconciliation );
        this.reconciliationPeriodRepository = this.transaction.getRepository( ReconciliationPeriod );
        this.reconciliationMatchRepository = this.transaction.getRepository( ReconciliationMatch );
    }

    private async createPeriod(reconciliation: Reconciliation, validFromInfo: string, validUntilInfo: string )
    {
        const reconciliationPeriod = new ReconciliationPeriod();
        reconciliationPeriod.validFrom = this.ymdToDate( validFromInfo );
        reconciliationPeriod.validUntil = this.ymdToDate( validUntilInfo );
        reconciliationPeriod.reconciliation = reconciliation;
        reconciliationPeriod.matches = [];
        reconciliation.periods.push( reconciliationPeriod );
        await this.reconciliationPeriodRepository.insert( reconciliationPeriod );
        return reconciliationPeriod;
        
    }

    private async createMatch( period: ReconciliationPeriod, trigger: string, validFor: AmountRangeInfo | undefined, templateName: string )
    {
        const reconciliationMatch = new ReconciliationMatch();
        reconciliationMatch.reconciliationPeriod = period;
        reconciliationMatch.trigger = trigger;
        const journalTemplate = await this.findTemplateByName( templateName );
        if (journalTemplate === undefined) this.notifyError( `Journal template "${templateName}" is unknown for ${period.reconciliation.relation.name}.` );
        else {
            reconciliationMatch.journalTemplate = journalTemplate;
            if (validFor === undefined) {
                reconciliationMatch.amountFrom = journalTemplate.validMin;
                reconciliationMatch.amountUntil = journalTemplate.validMax;
            } else {
                const amountRange = new AmountRange( validFor );
                reconciliationMatch.amountFrom = amountRange.validMin;
                reconciliationMatch.amountUntil = amountRange.validMax;                        
            }
            period.matches.push( reconciliationMatch );
            await this.reconciliationMatchRepository.insert( reconciliationMatch );
        }
        return reconciliationMatch;
    }

    protected async insert() {

        const data: BankConnection[] = json;
        for ( const bankConnection of data) {
            const relation = new Relation();
            relation.name = bankConnection.name;
            relation.description = (bankConnection.description ? bankConnection.description :relation.name).toUpperCase();
            await this.relationRepository.insert( relation );
            for ( const ref of bankConnection.references ){
                const relationReference = new RelationReference();
                relationReference.relation = relation;
                relationReference.reference = ref;
                await this.relationReferencesRepository.insert( relationReference );
            }
            for ( const connection of (bankConnection.connections || []) ){
                const reconciliation = new Reconciliation();
                reconciliation.relation = relation;
                const bankAccount = await this.findBankAccountByIban( connection.IBAN );
                if (bankAccount === undefined){
                    this.notifyError( `Unknown bank account: ${connection.IBAN}; skipping reconciliation info` );
                    return;
                } 
                reconciliation.bankAccount = bankAccount;
                reconciliation.periods = [];
                await this.reconciliationRepository.insert( reconciliation );
                if (connection.reconciliation !== undefined && connection.reconciliation.length > 0 ) {
                    for ( const reconciliationInfo of connection.reconciliation ) {
                        const period = await this.createPeriod( reconciliation, reconciliationInfo.validFrom, reconciliationInfo.validUntil );
                        for ( const matchInfo of reconciliationInfo.matches ){
                            await this.createMatch( period, matchInfo.trigger || "", matchInfo.validFor, matchInfo.templateName );
                        }
                    } 
                } else {
                    const period = await this.createPeriod( reconciliation, "2010-01-01", `${new Date().getFullYear()}-12-31` );
                    await this.createMatch( period, "", undefined, connection.templateName! );
                }
            }
        }
    }    
    
    protected async remove() {
        await this.relationRepository.delete( {id: MoreThan( 0 ) } )
    }
}

new InsertBankAccountReconciliation().run();
