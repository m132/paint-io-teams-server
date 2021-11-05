import { Stage } from '../../../stage.js';
import { LegacyPlayer, LegacyProtocol } from '../index.js';

export class LegacyProtocolService {
    constructor(
        public protocol: LegacyProtocol
    ) {
        this.protocol = protocol;
    }

    onPlayerRegistered(player: LegacyPlayer) { }
    onPlayerUnregistered(player: LegacyPlayer) { }
    onStageRegistered(stage: Stage) { }
    onStageUnregistered(stage: Stage) { }
}
