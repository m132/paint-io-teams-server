import { Socket } from 'socket.io';

import { Stage } from '../../model'
import { LegacyProtocolService } from './model';

export class CatchAllService implements LegacyProtocolService {
    constructor(
        public socket: Socket,
        public stage: Stage
    ) {
        socket.data.services.push(this);
        
        this.socket = socket;
        this.stage = stage;

        socket.onAny(this.#handleAny);
    }

    #handleAny = (event: string) => {
        switch (event) {
            case 'sendPing':
            case 'SystemHandshakeClient':
            case 'SystemClientIsReady':
            case 'SystemLatencyPong':
            case 'PlayerControlsInputAction':
            case 'PlayerMessagesToServer':
                break;
            default:
                console.warn(`LEGACY#${this.socket.id}: Unknown event received:`, event);
        }
    }
        
    unregister() {
        this.socket.offAny(this.#handleAny);
        this.socket.data.services.splice(this.socket.data.services.indexOf(this), 1)
    }
}
