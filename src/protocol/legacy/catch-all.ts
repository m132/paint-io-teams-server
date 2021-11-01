import { Socket } from 'socket.io';

import { LegacyProtocol } from '.';
import { Stage } from '../../model';
import { LegacyProtocolService } from './model';

export class CatchAllService extends LegacyProtocolService {
    constructor(
        public protocol: LegacyProtocol
    ) {
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
                    console.warn(`LEGACY#${socket.id}: Unknown event received:`, event);
            }
        });
}
