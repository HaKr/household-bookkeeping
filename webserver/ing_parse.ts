const started = process.hrtime();
console.log( "Start" );
import * as rest from "request";

const NS2MS = 1e6;

function elapsed( since: [number, number] ){
    const endtime = process.hrtime( since );
    return `${endtime[0]} s, ${endtime[1] / NS2MS} ms`
}

const json = {
    journal: {
        bookingDate: `${new Date()}`,
        description: "Test 101",
        transactions: [
            { accountId: 25, sign:  1, amount: 666.67 },
            { accountId: /*69*/7, sign: -1, amount: 666.666 }          
        ]
    }
}

console.log( "request" );
const reqstart = process.hrtime();

rest.post( "http://localhost:8088/journal", { json }, (error, res, body) => {
  if (error) {
    console.error(error)
    return
  }

  console.log( "response", elapsed(reqstart), elapsed(started));

  console.log(`statusCode: ${res.statusCode}`)
  console.dir(body, {depth: 10})
});

console.log( "EOF", elapsed(started));
