export enum DebitOrCredit {
    Debit = 1,
    Credit = -1
};

/**
 * How is the transaction amount to be determined?
 * - Fixed means the exact amount as specified in this template
 * - Percentage means that the template amount is the percentage of the amount of the instance
 * - Remainder means the value of the subtotal of all instantiated transactions thus far
 */
export enum TransactionTemplateType {
    Fixed = "F",
    Percentage = "P",
    Remainder = "R"
};

export const CURRENCY_DIMENSIONS: { type?: any, precision?: number, scale?: number } = { type:"decimal", precision: 11, scale: 2 };
