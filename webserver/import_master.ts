import * as csvtojson from "csvtojson";
import * as fs from "fs";

csvtojson({trim: true})
    .fromFile("master\ data/upload/Alle_rekeningen_01-01-2018_31-10-2019.csv")
    .then( parse );

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

interface Ref { reference: string, name?: string }

function refRef( ref: Ref ){ return ref.name ? ref.name : ref.reference; }

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

let n = 0;

function cleanRec( ing: INGCSV ){
    const kw = parseMed( ing.Mededelingen, {} );

    // const parts=ing.Mededelingen.split( re0 );
    // let desc = parts.shift()!.trim();
    // const keywords = parts.map( keywordExtractor ).filter( (e) => e !== null );
    // const result: {[index: string]: string } = {};
    // for ( const keyword of keywords ){
    //     for (  const keyName in keyword ){
    //         if (! keywordSet.has( keyName ) ) keywordSet.add( keyName );
    //         result[ keyName ] = keyword[ keyName ];
    //     }
    //     if ( keyword!.Omschrijving ) desc += (desc.length > 1 ? " " : "") + keyword!.Omschrijving;
    // }
    
    // result.description = desc;
    return kw;
        // .replace( `Naam: ${ing["Naam / Omschrijving"]} Omschrijving: `, "" )
        // .replace( /Factuur zien\? Check: ziggo.nl\/mijnziggo\s*/, "" )
        // .replace( `IBAN: ${ing.Tegenrekening} `, "" )
        // .replace( /Valutadatum: \S{10}/, "" )
        // .trim()
    ;
}

function compareRefs( refA: Ref, refB: Ref ){
    const a = refRef( refA );
    const b = refRef( refB );

    return a.localeCompare( b );
}

function parse( ing: INGCSV[] ){
    let maxName = 0, maxMed = 0;
    const uniq = new Map<string,Ref>();
    
    for ( const rec of ing ){
        const cleanedRec = cleanRec( rec );
        const med = cleanedRec.Omschrijving!;
        const naamOmschrijving = rec["Naam / Omschrijving"].trim();
        const nameLength = naamOmschrijving.length;
        const medLength = med.length;

        maxName = Math.max( maxName, nameLength  );
        maxMed = Math.max( maxMed, medLength );

        const ref: Ref = rec["Tegenrekening"].length > 0 ?
            { reference: rec["Tegenrekening"], name: naamOmschrijving } :
            { reference: naamOmschrijving }
        ;

        if (!uniq.has( ref.reference ) ) uniq.set( ref.reference, ref );
        //if (nameLength > 64) console.log( "NAME:", refRef( ref ) );
        //if (medLength > 200) console.log( "OMSC:", refRef( ref ), "MED=",med );
        if ( cleanedRec.IBAN !== undefined && rec.Tegenrekening !== cleanedRec.IBAN ) console.log( "NAME:", refRef( ref ), "REK", rec.Tegenrekening, "IBAN", cleanedRec.IBAN, "REC", rec, "CLEANED", cleanedRec );
        if ( cleanedRec.Naam !== undefined && naamOmschrijving !== cleanedRec.Naam ) console.log( "NAME:", refRef( ref ), "REC", "|"+naamOmschrijving+"|", "CLEANED", "|"+cleanedRec.Naam+"|", "REC", rec, "CLEANED", cleanedRec );
    }

    const res = Array.from( uniq.values() );

    console.log( `Med: ${maxMed}, Name: ${maxName}, keys: ${res.length}.` )
    const result =  res.sort( compareRefs );
    fs.writeFileSync( "./master\ data/references.json", JSON.stringify( result, undefined, "\t" ) );
    console.dir( keywordSet );
}
