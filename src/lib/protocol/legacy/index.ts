import { EventEmitter } from 'events';

import { Server, Socket } from 'socket.io';

import { logger as parentLogger } from '../../log/index.js';
import { Direction, Player, Stage } from '../../index.js';
import { Protocol } from '../index.js';
import { LegacyProtocolService } from './services/index.js';
import { CatchAllService } from './services/catch-all.js';
import { PingService } from './services/ping.js';
import { PlayerService } from './services/player.js';
import { SystemService } from './services/system.js';

const logger = parentLogger.sub('LegacyProtocol');

type SerializedFacing = 'left' | 'up' | 'right' | 'down';

export interface SerializedPlayer {
    id?: string,
    ping?: number,
    x?: number,
    y?: number,
    facing?: SerializedFacing,
    name: string,
    country: string,
    characterId: number,
    gameeId?: number | null,
    gameeData?: {
        avatar?: string | null,
        firstName?: string | null,
        lastName?: string | null
    },
    isBattle?: boolean,
    preferredSideData?: any,
    xp?: number,
    skillSlotsSettings?: any,
    activeConsumables?: any,
    activeEffect?: any
}

export function serializePlayer(player: Player, stage: Stage) {
    return {
        id: player.id,
        name: player.name,
        country: player.country,
        teamId: 1,
        characterId: player.characterId,
        ping: Math.round(player.ping),
        x: Math.round(player.coordinates[0] * 32) + 16,
        y: Math.round(player.coordinates[1] * 32) + 16,
        facing: Direction[player.direction.effective].toLowerCase() as SerializedFacing,
        level: 1,
        isInvisible: false,
        isAdmin: false
    }
}

export class LegacyPlayer extends Player {
    pingInterval: ReturnType<typeof setInterval> | null = null;

    constructor(
        public socket: Socket
    ) {
        super();
        this.socket = socket;

        this.id = socket.id;
    }
}

export class LegacyProtocol extends EventEmitter implements Protocol {
    stages: Stage[];
    io: Server;
    services: LegacyProtocolService[];

    constructor() {
        super();
        this.stages = [];

        this.io = new Server(3000, {
            allowEIO3: true,
            cors: {
                origin: 'http://localhost:9000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.io.on('connection', this.#handleConnection.bind(this));

        this.services = [
            new PingService(this),
            new SystemService(this),
            new PlayerService(this),
            new CatchAllService(this)
        ];

        this.on('stageRegistered', (stage: Stage) => {
            this.stages.push(stage);

            for (let service of this.services)
                service.onStageRegistered(stage);

            logger.debug(`Attached to stage ${stage.id}`);
        });

        logger.info('Listening on http://localhost:3000/');
    }

    #handleConnection(socket: Socket) {
        /* TODO: expose information in a generic manner here */
        this.emit('connection');
        logger.info(`LEGACY#${socket.id}: New connection from ${socket.handshake.address}`);

        socket.on('disconnect', (reason) => {
            this.emit('disconnect');
            logger.info(`LEGACY#${socket.id}: Disconnected (${reason})`);
        });
    }
}
