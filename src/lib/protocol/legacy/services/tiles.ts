import { logger as parentLogger } from '../../../log/index.js';
import { Player, Stage, Team } from '../../../index.js';
import { LegacyProtocol } from '../index.js';
import { LegacyProtocolService } from './index.js';

const logger = parentLogger.sub('LegacyProtocol', 'TilesService');

export class TilesService extends LegacyProtocolService {
    constructor(protocol: LegacyProtocol) {
        super(protocol);

        for (let stage of protocol.stages)
            this.onStageRegistered(stage);
    }

    override onStageRegistered = (stage: Stage) => {
        let stageRoom = this.protocol.io.to(`stage:${stage.id}`);

        stage.on('tailsUpdated', () => stageRoom.emit('TilesFullUpdate', {
            tails: stage.players.flatMap(player =>
                player.tail.map(([x, y]) => [x * 32, y * 32, player.team]))
        }));

        stage.on('territoryConquered', (conquered: [number, number, Player][]) =>
            [Team.FIRST, Team.SECOND, Team.THIRD, Team.FOURTH].forEach(team => {
                let message = {
                    tiles: conquered
                        .filter(tile => tile[2].team === team)
                        .map(([x, y]) => [x, y]),
                    teamId: team
                }
                if (message.tiles.length)
                    stageRoom.emit('TilesConquerTerritory', message);
            })
        );
    }
}
