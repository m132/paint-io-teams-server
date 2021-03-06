import { Socket } from 'socket.io';

import { logger as parentLogger } from '../../../log/index.js';
import { LegacyPlayer, LegacyProtocol } from '../index.js';
import { LegacyProtocolService } from './index.js';

const logger = parentLogger.sub('LegacyProtocol', 'PingService');

export class PingService extends LegacyProtocolService {
    constructor(protocol: LegacyProtocol) {
        super(protocol);

        this.protocol.io.on('connection', this.#onConnection);
    }

    #onConnection = (socket: Socket) => {
        socket.on('sendPing', () => {
            logger.verbose(`LEGACY#${socket.id}: Ping request received`);
            socket.emit('sendPong');
        });
        socket.emit('ready');
    }

    override onPlayerRegistered = (player: LegacyPlayer) => {
        let offset = performance.now();

        player.pingInterval = setInterval(() =>
            player.socket.emit('SystemLatencyPing', performance.now() - offset),
            1000);

        player.socket.on('SystemLatencyPong', (lastMs: number) =>
            player.ping = performance.now() - offset - lastMs
        );
    };

    override onPlayerUnregistered = (player: LegacyPlayer) => {
        if (player.pingInterval)
            clearInterval(player.pingInterval);
        player.pingInterval = null;
    }
}
