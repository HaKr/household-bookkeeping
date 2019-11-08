import * as csvtojson from "csvtojson";

csvtojson()
    .fromFile("master\ data/group_grid.csv")
    .then( console.log );
