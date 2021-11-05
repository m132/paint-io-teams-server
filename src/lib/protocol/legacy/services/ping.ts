import { Socket } from 'socket.io';

import { LegacyPlayer, LegacyProtocol } from '../index.js';
import { LegacyProtocolService } from './index.js';

export class PingService extends LegacyProtocolService {
    constructor(
        public protocol: LegacyProtocol
    ) {
        super(protocol);

        this.protocol.io.on('connection', this.#onConnection);
    }

    #onConnection = (socket: Socket) => {
        socket.on('sendPing', () => {
            console.log(`LEGACY#${socket.id}: Pong`);
            socket.emit('sendPong');
        });
        socket.emit('ready');
    }

    onPlayerRegistered = (player: LegacyPlayer) => {
        let offset = performance.now();

        player.pingInterval = setInterval(() =>
            player.socket.emit('SystemLatencyPing', performance.now() - offset),
            1000);

        player.socket.on('SystemLatencyPong', (lastMs: number) =>
            player.ping = performance.now() - offset - lastMs
        );
    };

    onPlayerUnregistered = (player: LegacyPlayer) => {
        if (player.pingInterval)
            clearInterval(player.pingInterval);
        player.pingInterval = null;
    }
}
