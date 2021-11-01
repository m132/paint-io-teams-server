import { Socket } from 'socket.io';

import { Direction, Player, Stage } from '../../model';
import { LegacyProtocolService, serializePlayer } from './model';

export class PlayerService implements LegacyProtocolService {
    constructor(
        public socket: Socket,
        public stage: Stage
    ) {
        socket.data.services.push(this);

        this.socket = socket;
        this.stage = stage;

        socket.on('PlayerControlsInputAction', this.#handleInputAction);
        socket.on('PlayerMessagesToServer', this.#handleMessage);
        this.stage.on('playerJoined', this.#handlePlayerJoin);
        this.stage.on('playerLeft', this.#handlePlayerLeave);
        this.stage.on('tick', this.#handleTick);
    }

    #handleInputAction = (action: any) => {
        let socket = this.socket;
        let player = socket.data.player;

        switch (action.inputAction) {
            case 'moveLeft':
                player.direction = Direction.LEFT;
                break;
            case 'moveUp':
                player.direction = Direction.UP;
                break;
            case 'moveRight':
                player.direction = Direction.RIGHT;
                break;
            case 'moveDown':
                player.direction = Direction.DOWN;
                break;
            default:
                console.warn(`${socket.id}: Player issued an unknown input action:`, escape(action));
        }
    };

    // FIXME
    #handleMessage = (id: number) => {
        this.socket.emit('PlayerMessagesFromServer', {
            clientId: this.socket.id,
            messageId: id
        });
        this.socket.broadcast.emit('PlayerMessagesFromServer', {
            clientId: this.socket.id,
            messageId: id
        });
    }

    #handleTick = () =>
        this.socket.emit('PlayersUpdate',
            this.stage.players.map((p) => serializePlayer(p, this.stage)));

    #handlePlayerJoin = (p: Player) =>
        this.socket.emit('PlayerNew', serializePlayer(p, this.stage));

    #handlePlayerLeave = (p: Player) =>
        this.socket.emit('PlayerDisconnect', p.id);

    unregister() {
        this.socket.removeListener('PlayerMessagesToServer', this.#handleMessage);
        this.socket.removeListener('PlayerControlsInputAction', this.#handleInputAction);
        this.stage.removeListener('tick', this.#handleTick);
        this.stage.removeListener('playerJoined', this.#handlePlayerJoin);
        this.stage.removeListener('playerLeft', this.#handlePlayerLeave);
        this.socket.data.services.splice(this.socket.data.services.indexOf(this), 1);
    }
}
