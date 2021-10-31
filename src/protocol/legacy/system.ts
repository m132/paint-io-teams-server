import { Socket } from 'socket.io';

import { Stage } from '../../model'
import { LegacyProtocolService, serializePlayer } from './model';
import { PingService } from './ping';
import { PlayerService } from './player';

export class SystemService implements LegacyProtocolService {
    constructor(
        public socket: Socket,
        public stage: Stage
    ) {
        socket.data.services.push(this);

        this.socket = socket;
        this.stage = stage;

        socket.once('SystemHandshakeClient', this.#handleHandshake);        
    }

    #handleHandshake = (handshake: any) => {
        let socket = this.socket;
        socket.removeListener('SystemHandshakeClient', this.#handleHandshake)

        console.log(`LEGACY#${socket.id}: Logged in as ${handshake.name} from ${handshake.country}`);
        let player = socket.data.player = this.stage.createPlayer(
            socket.id,
            handshake.name,
            handshake.country,
            handshake.characterId
        );
        let blockSize = this.stage.tileMap.blockSize;

        socket.emit('SystemHandshakeServer', {
            x: Math.round(player.coordinates[0] * blockSize),
            y: Math.round(player.coordinates[1] * blockSize),
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
            players: this.stage.players.map((p) => serializePlayer(p, this.stage)),
            worldSize: [this.stage.tileMap.width, this.stage.tileMap.height],
            blockSize: this.stage.tileMap.blockSize,
            enabledMinimap: true,
            isRoundRestartInProgress: false,
            winPercentLimit: 70,
            teamCount: 4,
            buildNumber: 'staging',
            mapData: [[43,12,1],[13,13,1],[14,13,1],[15,13,1],[16,13,1],[11,14,1],
                      [12,14,1],[10,15,1],[9,16,1],[8,17,1],[8,18,1],[24,18,1],
                      [25,18,1],[26,18,1],[32,18,1],[42,18,1],[8,19,1],[23,19,1],
                      [27,19,1],[32,19,1],[34,19,1],[37,19,1],[42,19,1],[46,19,1],
                      [8,20,1],[22,20,1],[28,20,1],[32,20,1],[33,20,1],[35,20,1],
                      [36,20,1],[38,20,1],[41,20,1],[46,20,1],[48,20,1],[49,20,1],
                      [50,20,1],[51,20,1],[8,21,1],[22,21,1],[29,21,1],[32,21,1],
                      [35,21,1],[38,21,1],[41,21,1],[46,21,1],[47,21,1],[51,21,1],
                      [9,22,1],[22,22,1],[29,22,1],[32,22,1],[35,22,1],[38,22,1],
                      [41,22,1],[45,22,1],[51,22,1],[9,23,1],[22,23,1],[29,23,1],
                      [32,23,1],[35,23,1],[38,23,1],[41,23,1],[45,23,1],[51,23,1],
                      [55,23,1],[56,23,1],[10,24,1],[19,24,1],[23,24,1],[28,24,1],
                      [32,24,1],[35,24,1],[38,24,1],[41,24,1],[45,24,1],[51,24,1],
                      [54,24,1],[57,24,1],[58,24,1],[59,24,1],[11,25,1],[19,25,1],
                      [24,25,1],[25,25,1],[26,25,1],[27,25,1],[38,25,1],[41,25,1],
                      [45,25,1],[50,25,1],[54,25,1],[60,25,1],[12,26,1],[17,26,1],
                      [18,26,1],[45,26,1],[50,26,1],[53,26,1],[60,26,1],[13,27,1],
                      [14,27,1],[15,27,1],[16,27,1],[50,27,1],[53,27,1],[60,27,1],
                      [53,28,1],[59,28,1],[54,29,1],[55,29,1],[58,29,1],[56,30,1],
                      [58,30,1],[57,31,1],[57,32,1],[19,33,1],[20,33,1],[21,33,1],
                      [22,33,1],[56,33,1],[18,34,1],[55,34,1],[17,35,1],[55,35,1],
                      [17,36,1],[18,36,1],[30,36,1],[31,36,1],[54,36,1],[19,37,1],
                      [20,37,1],[21,37,1],[22,37,1],[23,37,1],[28,37,1],[29,37,1],
                      [32,37,1],[37,37,1],[38,37,1],[39,37,1],[49,37,1],[50,37,1],
                      [51,37,1],[52,37,1],[53,37,1],[24,38,1],[27,38,1],[33,38,1],
                      [36,38,1],[40,38,1],[44,38,1],[25,39,1],[27,39,1],[33,39,1],
                      [35,39,1],[41,39,1],[44,39,1],[46,39,1],[47,39,1],[25,40,1],
                      [27,40,1],[33,40,1],[35,40,1],[41,40,1],[44,40,1],[45,40,1],
                      [48,40,1],[24,41,1],[28,41,1],[32,41,1],[35,41,1],[40,41,1],
                      [43,41,1],[49,41,1],[21,42,1],[22,42,1],[23,42,1],[29,42,1],
                      [30,42,1],[31,42,1],[36,42,1],[39,42,1],[43,42,1],[49,42,1],
                      [16,43,1],[17,43,1],[18,43,1],[19,43,1],[20,43,1],[37,43,1],
                      [38,43,1],[42,43,1],[49,43,1],[42,44,1],[48,44,1],[47,45,1],
                      [46,46,1],[27,47,1],[28,47,1],[29,47,1],[32,47,1],[33,47,1],
                      [26,48,1],[30,48,1],[31,48,1],[34,48,1],[26,49,1],[30,49,1],
                      [34,49,1],[26,50,1],[33,50,1],[26,51,1],[32,51,1],[27,52,1],
                      [31,52,1],[28,53,1],[30,53,1],[29,54,1]]
        });

        new PingService(socket, this.stage);
        new PlayerService(socket, this.stage);
    }

    unregister() {
        this.socket.removeListener('SystemHandshakeClient', this.#handleHandshake)
        this.stage.destroyPlayer(this.socket.data.player);
        this.socket.data.services.splice(this.socket.data.services.indexOf(this), 1);
    }
}
