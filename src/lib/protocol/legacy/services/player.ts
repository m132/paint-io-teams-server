import { logger as parentLogger } from '../../../log/index.js';
import { DeathNews, Direction, Player, Stage } from '../../../index.js';
import { LegacyPlayer, LegacyProtocol, serializePlayer } from '../index.js';
import { LegacyProtocolService } from './index.js';

const logger = parentLogger.sub('LegacyProtocol', 'PlayerService');

export class PlayerService extends LegacyProtocolService {
    constructor(protocol: LegacyProtocol) {
        super(protocol);

        for (let stage of protocol.stages)
            this.onStageRegistered(stage);
    }

    override onStageRegistered = (stage: Stage) => {
        let stageRoom = this.protocol.io.to(`stage:${stage.id}`);

        stage.on('playerJoined', (player) =>
            stageRoom.emit('PlayerNew', serializePlayer(player, stage)));
        stage.on('playerLeft', (player) =>
            stageRoom.emit('PlayerDisconnect', player.id));
        stage.on('message', (player, message) =>
            stageRoom.emit('PlayerMessagesFromServer', { clientId: player.id, messageId: message }));
        stage.on('tick', () =>
            stageRoom.emit('PlayersUpdate', stage.players.map((p) => serializePlayer(p, stage))));
        stage.on('playersRespawned', (players: Player[]) =>
            players.forEach(player => 
                stageRoom.emit({Request: "PlayerRespawnRequest", Accept: "PlayerRespawnAccept"} as any, player.id)));
        stage.on('playersDead', (deaths: DeathNews) =>
            deaths.forEach(death =>
                stageRoom.emit('PlayerDead', {
                    attacker: death.attacker.id,
                    attackerTeamId: death.attacker.team,
                    damageType: 'player',
                    victim: death.victim.id,
                    victimTeamId: death.victim.team,
                    x: death.victim.coordinates[0],
                    y: death.victim.coordinates[1]
                })
            )
        );
    };

    override onPlayerRegistered = (player: LegacyPlayer) => {
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
                    logger.warn(`LEGACY#${player.id}: Player issued an unknown input action: ${action}`);
            }
    };

    #onMessagesToServer = (player: LegacyPlayer, message: number) => {
        if (player.stage)
            player.stage.emit('message', player, message);
    }
}
