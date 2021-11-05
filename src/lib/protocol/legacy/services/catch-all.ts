import { Socket } from 'socket.io';

import { logger as parentLogger } from '../../../log/index.js';
import { LegacyProtocol } from '../index.js';
import { LegacyProtocolService } from './index.js';

const logger = parentLogger.sub('LegacyProtocol', 'CatchAllService');

export class CatchAllService extends LegacyProtocolService {
    constructor(protocol: LegacyProtocol) {
        super(protocol);
        protocol.io.on('connection', this.#onConnection)
    }

    #onConnection = (socket: Socket) =>
        socket.onAny((event: string) => {
            switch (event) {
                case 'sendPing':
                case 'SystemHandshakeClient':
                case 'SystemClientIsReady':
                case 'SystemLatencyPong':
                case 'PlayerControlsInputAction':
                case 'PlayerMessagesToServer':
                    break;
                default:
                    logger.warn(`LEGACY#${socket.id}: Unknown event received: ${event}`);
            }
        });
}
