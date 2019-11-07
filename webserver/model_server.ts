import "reflect-metadata";

import {createConnection, Connection} from "typeorm";

import * as express from "express";
import { Server } from '@overnightjs/core';
import * as controllers from './controllers';
import { Logger } from '@overnightjs/logger';

class ModelServer extends Server {

    private readonly SERVER_STARTED = 'Example server started on port: ';

    constructor() {
        super(true);
        this.app.use( express.json() );
        this.setupControllers();
    }

    private setupControllers(): void {
        const ctlrInstances = [];
        for (const name in controllers) {
            if (controllers.hasOwnProperty(name)) {
                Logger.Info(`Add controller: ${name}.`);
                const controller = (controllers as any)[name];
                ctlrInstances.push(new controller());
            }
        }
        super.addControllers(ctlrInstances);
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            Logger.Imp(this.SERVER_STARTED + port);
        });
    }
}


createConnection().then(async _connection => {
    const modelServer = new ModelServer();
    modelServer.start(8088);
}).catch( e => {
    console.error("Could not start model server", e );
});
