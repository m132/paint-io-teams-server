import { Socket } from 'socket.io';

import { Stage } from '../../model'
import { LegacyProtocolService } from './model';

export class PingService implements LegacyProtocolService {
    #pingOffset: number;
    #pingInterval: ReturnType<typeof setInterval>;

    constructor(
        public socket: Socket,
        public stage: Stage
    ) {
        socket.data.services.push(this);
        
        this.socket = socket;
        this.stage = stage;

        this.#pingOffset = performance.now();
        this.#pingInterval = setInterval(() => {
            /* TODO: make it less forgeable */
            socket.emit('SystemLatencyPing', performance.now() - this.#pingOffset);
        }, 1000);

        socket.on('SystemLatencyPong', this.#handlePong);
    }

    #handlePong = (lastMs: number) => 
       this.socket.data.player.ping = performance.now() - this.#pingOffset - lastMs;

    unregister() {
        clearInterval(this.#pingInterval);
        this.socket.removeListener('SystemLatencyPong', this.#handlePong);
        this.socket.data.services.splice(this.socket.data.services.indexOf(this), 1)
    }
}
