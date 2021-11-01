import { EventEmitter } from 'events';

import { Server, Socket } from 'socket.io';

import { ServerState, Protocol, Stage } from '../../model';
import { LegacyProtocolService } from './model';
import { CatchAllService } from './catch-all';
import { SystemService } from './system';

export default class LegacyProtocol extends EventEmitter implements Protocol {
    #stage: Stage;
    #io: Server;

    constructor(server_state: ServerState) {
        super();
        this.#stage = server_state.stages[0];

        this.#io = new Server(3000, {
            allowEIO3: true,
            cors: {
                origin: 'http://localhost:9000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.#io.on('connection', this.#handleConnection.bind(this));
    }

    #handleConnection(socket: Socket) {
        /* TODO: expose information in a generic manner here */
        this.emit('connection');
        console.log(`LEGACY#${socket.id}: New connection from ${socket.handshake.address}`);

        socket.data.services = [];

        new CatchAllService(socket, this.#stage);

        /* legacy game protocol */
        new SystemService(socket, this.#stage);

        socket.on('disconnect', (reason) => {
            socket.data.services.reduceRight(
                (prev: never, cur: LegacyProtocolService) => cur.unregister());
            this.emit('disconnect');
            console.log(`LEGACY#${socket.id}: Disconnected (${reason})`);
        });

        /* legacy ping protocol */
        socket.on('sendPing', () => {
            console.log(`LEGACY#${socket.id}: Pong`);
            socket.emit('sendPong');
        });
        socket.emit('ready');
    }
}
