export enum DebitOrCredit {
    Debit = 1,
    Credit = -1
};

/**
 * How is the transaction amount to be determined?
 * - Bank means that the full amount is to be booked on the linked financial account
 * - Fixed means the exact amount as specified in this template
 * - Percentage means that the template amount is the percentage of the amount of the instance
 * - Remainder means the value of the subtotal of all instantiated transactions thus far
 */
export enum TransactionTemplateType {
    Bank = "B",
    Fixed = "F",
    Percentage = "P",
    Remainder = "R"
};

export const CURRENCY_DIMENSIONS: { type?: any, precision?: number, scale?: number } = { type:"decimal", precision: 11, scale: 2 };

export const SIZES = {
    NAME: 50,
    REFERENCE: 64,
    BANK_DESCRIPTION: 250,
    DESCRIPTION: 100
};
