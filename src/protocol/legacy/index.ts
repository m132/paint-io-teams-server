import { EventEmitter } from 'events';

import { Server, Socket } from 'socket.io';

import { Protocol, Stage } from '../../model';
import { LegacyProtocolService } from './model';
import { PingService } from './ping';
import { SystemService } from './system';
import { PlayerService } from './player';
import { CatchAllService } from './catch-all';

export class LegacyProtocol extends EventEmitter implements Protocol {
    stages: Stage[];
    io: Server;
    services: LegacyProtocolService[];

    constructor() {
        super();
        this.stages = [];

        this.io = new Server(3000, {
            allowEIO3: true,
            cors: {
                origin: 'http://localhost:9000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.io.on('connection', this.#handleConnection.bind(this));

        this.services = [
            new PingService(this),
            new SystemService(this),
            new PlayerService(this),
            new CatchAllService(this)
        ];

        this.on('stageRegistered', (stage: Stage) => {
            this.stages.push(stage);

            for (let service of this.services)
                service.onStageRegistered(stage);
        });
    }

    #handleConnection(socket: Socket) {
        /* TODO: expose information in a generic manner here */
        this.emit('connection');
        console.log(`LEGACY#${socket.id}: New connection from ${socket.handshake.address}`);

        socket.on('disconnect', (reason) => {
            this.emit('disconnect');
            console.log(`LEGACY#${socket.id}: Disconnected (${reason})`);
        });
    }
}
