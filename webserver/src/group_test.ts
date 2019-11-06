import "reflect-metadata";

import {createConnection, Connection} from "typeorm";
import { Group } from './entity/group';

createConnection().then(async connection => {
    const trees = await connection.getTreeRepository( Group ).findTrees();
    console.log( "Trees:" );
    console.dir( trees, {depth: 5} );
    connection.close();
}).catch( e => {
    console.error("Could not start model server", e );
});
