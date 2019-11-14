import { TransactionTemplateType } from "./constants";

interface Unbalanced {
    category: string, 
    dbcr: "CR" | "DB", 
    value : string
}

interface BalanceResult {
    isBalanced: boolean,
    unbalanced: Unbalanced[]
}

export class SubtotalCalculator {
    protected groupedSubtotals: { [ index: string ]: number } = { B: 0, E: 0 };

    public add( groupNumber: string, amount: number, sign: number = 1 ){
        if ( !this.groupedSubtotals.hasOwnProperty( groupNumber ) ) this.groupedSubtotals[ groupNumber ] = 0;
        this.groupedSubtotals[ groupNumber ] += sign*amount;
    }

    public checkBalance() {
        const result: BalanceResult = { isBalanced: true, unbalanced: [] };

        for (const category in this.groupedSubtotals ){
            const subtotal = this.groupedSubtotals[ category ];
            const message = format( subtotal, category );
            if ( message !== null ){
                result.isBalanced = false;
                result.unbalanced.push( message );
            }
        }

        return result;
    }
}

class RelativeSubtotal {
    private subtotals: {[index: string]: number} = { [TransactionTemplateType.Fixed]: 0, [TransactionTemplateType.Percentage]: 0 };

    constructor ( private readonly category: string ){}

    public add( method: TransactionTemplateType, amount: number, sign: number = 1 ) {
        if ( method === TransactionTemplateType.Remainder ){
            this.subtotals[TransactionTemplateType.Fixed] = 0;
            this.subtotals[TransactionTemplateType.Percentage] = 0;
        } else {
            this.subtotals[ method ] += sign*amount;
        }
    }

    public checkBalance( result: BalanceResult ) {
        const checkOne = ( amount: number, suffix?: string ) => {
            const message = format( amount, this.category, suffix );
            if ( message !== null ){
                result.isBalanced = false;
                result.unbalanced.push( message );
            }
        }
        checkOne( this.subtotals[TransactionTemplateType.Fixed] );
        checkOne( this.subtotals[TransactionTemplateType.Percentage], "%" );

        return result;
    }

}

export class RelativeSubtotalCalculator {
    protected groupedSubtotals: { [ index: string ]: RelativeSubtotal } = {};

    public add( groupNumber: string, method: TransactionTemplateType, amount: number, sign: number = 1 ){
        if ( !this.groupedSubtotals.hasOwnProperty( groupNumber ) ) this.groupedSubtotals[ groupNumber ] = new RelativeSubtotal( groupNumber );
        this.groupedSubtotals[ groupNumber ]!.add( method, amount, sign );
    }

    public checkBalance() {
        const result: {isBalanced: boolean, unbalanced: any[] } = { isBalanced: true, unbalanced: [] };

        for (const category in this.groupedSubtotals ){
            const subtotal = this.groupedSubtotals[ category ];
            subtotal!.checkBalance( result );
        }

        return result;
    }
}

function format( amount: number, category: string, suffix = "" ): Unbalanced | null {
    const stringLength = suffix.length > 0 ? 1 : 2;
    const value = Math.abs( amount ).toFixed( stringLength )+suffix;
    if (value === "0.00" || value === "0.0%" ) return null;
    else return { category, dbcr: amount < 0 ? "CR" : "DB", value };
}
