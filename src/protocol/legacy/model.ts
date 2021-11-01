import { Direction, Player, Stage } from '../../model';

export interface LegacyProtocolService {
    unregister: () => void
}

type SerializedFacing = 'left' | 'up' | 'right' | 'down';

// TODO: split this
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
        x: Math.round(player.coordinates[0] * stage.tileMap.blockSize),
        y: Math.round(player.coordinates[1] * stage.tileMap.blockSize),
        facing: Direction[player.direction].toLowerCase() as SerializedFacing,
        level: 69,
        isInvisible: false,
        isAdmin: false
    }
}

export function deserializePlayer(id: string, serialized: SerializedPlayer, stage: Stage): Player {
    return stage.createPlayer(id, serialized.name, serialized.country, serialized.characterId);
}
