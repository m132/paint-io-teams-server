import { Direction, Stage } from '../../model';
import { LegacyProtocol } from './index';
import { LegacyPlayer, LegacyProtocolService, serializePlayer } from './model';

export class PlayerService extends LegacyProtocolService {
    constructor(
        public protocol: LegacyProtocol
    ) {
        super(protocol);

        for (let stage of protocol.stages)
            this.onStageRegistered(stage);
    }

    onStageRegistered = (stage: Stage) => {
        let stageRoom = this.protocol.io.to(`stage:${stage.id}`);

        stage.on('playerJoined', (player) =>
            stageRoom.emit('PlayerNew', serializePlayer(player, stage)));
        stage.on('playerLeft', (player) =>
            stageRoom.emit('PlayerDisconnect', player.id));
        stage.on('message', (player, message) =>
            stageRoom.emit('PlayerMessagesFromServer', { clientId: player.id, messageId: message }));
        stage.on('tick', () =>
            stageRoom.emit('PlayersUpdate', stage.players.map((p) => serializePlayer(p, stage))));
    };

    onPlayerRegistered = (player: LegacyPlayer) => {
        player.socket.on('PlayerControlsInputAction', (action) =>
            this.#onInputAction(player, action));
        player.socket.on('PlayerMessagesToServer', (message) =>
            this.#onMessagesToServer(player, message));
    };

    #onInputAction = (player: LegacyPlayer, action: any) => {
        /* TODO: move this check to model */
        if (player.direction.requested === player.direction.effective)
            switch (action.inputAction) {
                case 'moveLeft':
                    player.direction.requested = Direction.LEFT;
                    break;
                case 'moveUp':
                    player.direction.requested = Direction.UP;
                    break;
                case 'moveRight':
                    player.direction.requested = Direction.RIGHT;
                    break;
                case 'moveDown':
                    player.direction.requested = Direction.DOWN;
                    break;
                default:
                    console.warn(`LEGACY#${player.id}: Player issued an unknown input action:`, escape(action));
            }
    };

    #onMessagesToServer = (player: LegacyPlayer, message: number) => {
        if (player.stage)
            player.stage.emit('message', player, message);
    }
}
