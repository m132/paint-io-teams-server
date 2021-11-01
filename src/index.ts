import { ServerState, Player, Stage } from './model';
import LegacyProtocol from './protocol/legacy';

let server_state: ServerState = {
    protocols: [],
    stages: []
};

server_state.stages.push(new Stage().start(100));
server_state.protocols.push(new LegacyProtocol(server_state));

console.log('Game server started');
