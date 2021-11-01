import { Socket } from 'socket.io';

import { LegacyProtocol } from '.';
import { LegacyProtocolService, LegacyPlayer, serializePlayer } from './model';

export class SystemService extends LegacyProtocolService {
    constructor(
        public protocol: LegacyProtocol
    ) {
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

        console.log(`LEGACY#${socket.id}: Logged in as ${handshake.name} from ${handshake.country}`);
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
            teamId: 1,
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
            worldSize: [stage.tileMap.width + 1, stage.tileMap.height + 1],
            blockSize: 32,
            enabledMinimap: true,
            isRoundRestartInProgress: false,
            winPercentLimit: 70,
            teamCount: 4,
            buildNumber: 'staging',
            mapData: [[66, 35, 1], [36, 36, 1], [37, 36, 1], [38, 36, 1], [39, 36, 1], [34, 37, 1],
            [35, 37, 1], [33, 38, 1], [32, 39, 1], [31, 40, 1], [31, 41, 1], [47, 41, 1],
            [48, 41, 1], [49, 41, 1], [55, 41, 1], [65, 41, 1], [31, 42, 1], [46, 42, 1],
            [50, 42, 1], [55, 42, 1], [57, 42, 1], [60, 42, 1], [65, 42, 1], [69, 42, 1],
            [31, 43, 1], [45, 43, 1], [51, 43, 1], [55, 43, 1], [56, 43, 1], [58, 43, 1],
            [59, 43, 1], [61, 43, 1], [64, 43, 1], [69, 43, 1], [71, 43, 1], [72, 43, 1],
            [73, 43, 1], [74, 43, 1], [31, 44, 1], [45, 44, 1], [52, 44, 1], [55, 44, 1],
            [58, 44, 1], [61, 44, 1], [64, 44, 1], [69, 44, 1], [70, 44, 1], [74, 44, 1],
            [32, 45, 1], [45, 45, 1], [52, 45, 1], [55, 45, 1], [58, 45, 1], [61, 45, 1],
            [64, 45, 1], [68, 45, 1], [74, 45, 1], [32, 46, 1], [45, 46, 1], [52, 46, 1],
            [55, 46, 1], [58, 46, 1], [61, 46, 1], [64, 46, 1], [68, 46, 1], [74, 46, 1],
            [78, 46, 1], [79, 46, 1], [33, 47, 1], [42, 47, 1], [46, 47, 1], [51, 47, 1],
            [55, 47, 1], [58, 47, 1], [61, 47, 1], [64, 47, 1], [68, 47, 1], [74, 47, 1],
            [77, 47, 1], [80, 47, 1], [81, 47, 1], [82, 47, 1], [34, 48, 1], [42, 48, 1],
            [47, 48, 1], [48, 48, 1], [49, 48, 1], [50, 48, 1], [61, 48, 1], [64, 48, 1],
            [68, 48, 1], [73, 48, 1], [77, 48, 1], [83, 48, 1], [35, 49, 1], [40, 49, 1],
            [41, 49, 1], [68, 49, 1], [73, 49, 1], [76, 49, 1], [83, 49, 1], [36, 50, 1],
            [37, 50, 1], [38, 50, 1], [39, 50, 1], [73, 50, 1], [76, 50, 1], [83, 50, 1],
            [76, 51, 1], [82, 51, 1], [77, 52, 1], [78, 52, 1], [81, 52, 1], [79, 53, 1],
            [81, 53, 1], [80, 54, 1], [80, 55, 1], [42, 56, 1], [43, 56, 1], [44, 56, 1],
            [45, 56, 1], [79, 56, 1], [41, 57, 1], [78, 57, 1], [40, 58, 1], [78, 58, 1],
            [40, 59, 1], [41, 59, 1], [53, 59, 1], [54, 59, 1], [77, 59, 1], [42, 60, 1],
            [43, 60, 1], [44, 60, 1], [45, 60, 1], [46, 60, 1], [51, 60, 1], [52, 60, 1],
            [55, 60, 1], [60, 60, 1], [61, 60, 1], [62, 60, 1], [72, 60, 1], [73, 60, 1],
            [74, 60, 1], [75, 60, 1], [76, 60, 1], [47, 61, 1], [50, 61, 1], [56, 61, 1],
            [59, 61, 1], [63, 61, 1], [67, 61, 1], [48, 62, 1], [50, 62, 1], [56, 62, 1],
            [58, 62, 1], [64, 62, 1], [67, 62, 1], [69, 62, 1], [70, 62, 1], [48, 63, 1],
            [50, 63, 1], [56, 63, 1], [58, 63, 1], [64, 63, 1], [67, 63, 1], [68, 63, 1],
            [71, 63, 1], [47, 64, 1], [51, 64, 1], [55, 64, 1], [58, 64, 1], [63, 64, 1],
            [66, 64, 1], [72, 64, 1], [44, 65, 1], [45, 65, 1], [46, 65, 1], [52, 65, 1],
            [53, 65, 1], [54, 65, 1], [59, 65, 1], [62, 65, 1], [66, 65, 1], [72, 65, 1],
            [39, 66, 1], [40, 66, 1], [41, 66, 1], [42, 66, 1], [43, 66, 1], [60, 66, 1],
            [61, 66, 1], [65, 66, 1], [72, 66, 1], [65, 67, 1], [71, 67, 1], [70, 68, 1],
            [69, 69, 1], [50, 70, 1], [51, 70, 1], [52, 70, 1], [55, 70, 1], [56, 70, 1],
            [49, 71, 1], [53, 71, 1], [54, 71, 1], [57, 71, 1], [49, 72, 1], [53, 72, 1],
            [57, 72, 1], [49, 73, 1], [56, 73, 1], [49, 74, 1], [55, 74, 1], [50, 75, 1],
            [54, 75, 1], [51, 76, 1], [53, 76, 1], [52, 77, 1]]
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
