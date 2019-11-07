import { MigrationInterface, QueryRunner, Transaction, TransactionRepository, Repository } from "typeorm";
import { DebitOrCredit } from "../constants";

import { GroupRepository } from '../repository/group_repository';
import { Account } from '../entity/account';
import { JournalEntry } from '../entity/journal_entry';
import { AccountTransaction } from '../entity/account_transaction';

export class InsertDummyData implements MigrationInterface{
    name = "Insert dummy data 1573134558884"
    
    async up(queryRunner: QueryRunner) {
        const groupRepository = queryRunner.manager.getCustomRepository( GroupRepository);
        const assetsGroup = (await groupRepository.findByNumber( "BL" ))!;
        const liablitiesGroup = (await groupRepository.findByNumber( "BR" ))!;
        const expensesGroup = (await groupRepository.findByNumber( "EL" ))!;
        const incomeGroup = (await groupRepository.findByNumber( "ER" ))!;
        
        const bankHAccount = new Account();
        bankHAccount.number = "1201";
        bankHAccount.name = "ING Harry";
        bankHAccount.group = assetsGroup;
        await queryRunner.manager.save( bankHAccount );

        const groceriesAccount = new Account();
        groceriesAccount.number = "4321";
        groceriesAccount.name = "Boodschappen";
        groceriesAccount.group = expensesGroup;
        await queryRunner.manager.save( groceriesAccount );

        const reservationHAccount = new Account();
        reservationHAccount.number = "0212";
        reservationHAccount.name = "Harry's algemene reserve";
        reservationHAccount.group = liablitiesGroup;
        await queryRunner.manager.save( reservationHAccount );

        const incomeHAccount = new Account();
        incomeHAccount.number = "9201";
        incomeHAccount.name = "Inkomsten Harry";
        incomeHAccount.group = incomeGroup;
        await queryRunner.manager.save( incomeHAccount );

        const revenueHAccount = new Account();
        revenueHAccount.number = "9302";
        revenueHAccount.name = "Bijdrage Harry aan gezamenlijk";
        revenueHAccount.group = incomeGroup;
        await queryRunner.manager.save( revenueHAccount );

        const budgetRevenuesAccount = new Account();
        budgetRevenuesAccount.number = "9901";
        budgetRevenuesAccount.name = "Kostendkking uit budgetten";
        budgetRevenuesAccount.group = incomeGroup;
        await queryRunner.manager.save( budgetRevenuesAccount );

        const journalE = new JournalEntry()
        journalE.bookingDate = new Date();
        journalE.description = "Boodschappen Lidl"
        await queryRunner.manager.save( journalE );

        const amountE = 90;

        const transE1 = new AccountTransaction();
        transE1.account = groceriesAccount;
        transE1.journalEntry = journalE;
        transE1.amount = amountE;
        await queryRunner.manager.save( transE1 );

        const transE2 = new AccountTransaction();
        transE2.account = bankHAccount;
        transE2.journalEntry = journalE;
        transE2.amount = amountE;
        transE2.sign = DebitOrCredit.Credit;
        await queryRunner.manager.save( transE2 );

        const transE3 = new AccountTransaction();
        transE3.account = reservationHAccount;
        transE3.journalEntry = journalE;
        transE3.amount = amountE;
        await queryRunner.manager.save( transE3 );

        const transE4 = new AccountTransaction();
        transE4.account = revenueHAccount;
        transE4.journalEntry = journalE;
        transE4.amount = amountE;
        transE4.sign = DebitOrCredit.Credit;
        await queryRunner.manager.save( transE4 );

        const journalF = new JournalEntry()
        journalF.bookingDate = new Date();
        journalF.description = "De Judomat trainingen"
        await queryRunner.manager.save( journalF );

        const amountF = 300;

        const transF1 = new AccountTransaction();
        transF1.account = bankHAccount;
        transF1.journalEntry = journalF;
        transF1.amount = amountF;
        await queryRunner.manager.save( transF1 );

        const transF2 = new AccountTransaction();
        transF2.account = incomeHAccount;
        transF2.journalEntry = journalF;
        transF2.amount = amountF;
        transF2.sign = DebitOrCredit.Credit;
        await queryRunner.manager.save( transF2 );

        const transF3 = new AccountTransaction();
        transF3.account = budgetRevenuesAccount;
        transF3.journalEntry = journalF;
        transF3.amount = amountF;
        await queryRunner.manager.save( transF3 );

        const transF4 = new AccountTransaction();
        transF4.account = reservationHAccount;
        transF4.journalEntry = journalF;
        transF4.amount = amountF;
        transF4.sign = DebitOrCredit.Credit;
        await queryRunner.manager.save( transF4 );


    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query( "DELETE FROM account_transaction WHERE account_transaction.id>0")
        await queryRunner.query( "DELETE FROM journal_entry WHERE journal_entry.id>0")
        return queryRunner.query( "DELETE FROM account WHERE account.id>0")
    }

}
