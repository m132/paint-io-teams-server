import { Server, Stage } from './model';
import { LegacyProtocol } from './protocol/legacy';

new Server()
    .registerStage(new Stage('main').start(50))
    .registerProtocol(new LegacyProtocol());

console.log('Game server started');
