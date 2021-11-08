import { Socket } from 'socket.io';

import { logger as parentLogger } from '../../../log/index.js';
import { VERSION } from '../../../index.js';
import { LegacyPlayer, LegacyProtocol, serializePlayer } from '../index.js';
import { LegacyProtocolService } from './index.js';

const logger = parentLogger.sub('LegacyProtocol', 'SystemService');

export class SystemService extends LegacyProtocolService {
    constructor(protocol: LegacyProtocol) {
        super(protocol);
        this.protocol.io.on('connection', this.#onConnection);
    }

    #onConnection = async (socket: Socket) => {
        /* TODO: validation and type hints */
        let handshake: any = await new Promise((resolve, reject) =>
            socket.once('SystemHandshakeClient', (handshake: any) =>
                resolve(handshake)
            )
        );

        logger.info(`LEGACY#${socket.id}: Logged in as ${handshake.name} from ${handshake.country}`);
        let player = socket.data.player = new LegacyPlayer(socket);
        let stage = this.protocol.stages[0];

        player.update({
            id: socket.id,
            name: handshake.name,
            country: handshake.country,
            characterId: handshake.characterId
        });

        stage.addPlayer(player);

        socket.emit('SystemHandshakeServer', {
            x: Math.round(player.coordinates[0] * 32) + 16,
            y: Math.round(player.coordinates[1] * 32) + 16,
            teamId: player.team,
            isDead: false,
            isAdmin: false,
            activeShield: false,
            level: 69,
            isFreeze: false,
            isControllsJammed: false,
            gameeData: { avatar: null, firstName: null, lastName: null }
        });

        socket.emit('SystemLoadState', {
            players: stage.players.map((p) => serializePlayer(p, stage)),
            worldSize: [stage.tileMap.width, stage.tileMap.height],
            blockSize: 32,
            enabledMinimap: true,
            isRoundRestartInProgress: false,
            winPercentLimit: 70,
            teamCount: 4,
            buildNumber: VERSION,
            mapData: stage.tileMap.state.flatMap((row, y) => 
                row.map((team, x) => [x, y, team[0]])).filter((value) => value[2])
        });

        socket.join('players');
        socket.join(`stage:${stage.id}`);

        socket.on('disconnect', () => {
            for (let service of this.protocol.services)
                service.onPlayerUnregistered(player);

            stage.removePlayer(player);
        });

        for (let service of this.protocol.services)
            service.onPlayerRegistered(player);
    };
}
