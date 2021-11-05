import { Protocol } from './protocol/index.js';
import { Stage } from './stage.js';

export class Server {
    #protocols: Protocol[];
    #stages: Stage[];

    constructor() {
        this.#protocols = [];
        this.#stages = [];
    }

    registerProtocol(protocol: Protocol): Server {
        this.#protocols.push(protocol);

        for (let stage of this.#stages)
            protocol.emit('stageRegistered', stage);

        return this;
    }

    registerStage(stage: Stage): Server {
        this.#stages.push(stage);

        for (let protocol of this.#protocols)
            protocol.emit('stageRegistered', stage);

        return this;
    }
}
