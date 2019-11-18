import "reflect-metadata";
import * as express from "express";

import {createConnection, Connection} from "typeorm";

import { createExpressServer } from 'routing-controllers';
import * as controllers from './controllers';

const app = createExpressServer({
    cors: {
        "Access-Control-Allow-Origin": "*"
    },
    routePrefix: "data",
    controllers: [ 
        controllers.AccountController,
        controllers.JournalTemplateController,
        controllers.JournalController,
        controllers.JournalTransactionController,
        controllers.GroupController
    ] 
});

app.use( express.static( "www", {
    index: ["overview.html"],
    extensions: ["html"]
}) );

createConnection().then(async _connection => {
    app.listen( 8088, () => {
        console.info( "Houskeeping server started on", 8088 );
    });
}).catch( e => {
    console.error("Could not start model server", e );
});
