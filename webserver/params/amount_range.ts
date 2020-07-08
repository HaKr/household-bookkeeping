export type AmountRangeInfo = [ number, number? ];

export class AmountRange {
    public validMin: number;
    public validMax: number;

    constructor( range: AmountRangeInfo = [-999999999.99, 999999999.99]){
        const l = Number(range[ 0 ]);
        const r = range.length == 2 ? Number(range[ 1 ]!) : l+0.01;
        const [ min, max ] = [ Math.min( l, r ), Math.max( l, r) ];

        this.validMin = min;
        this.validMax = max;
    }
}

export const DEFAULT_RANGE = new AmountRange();
