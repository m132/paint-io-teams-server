#!/usr/bin/env node
import { LegacyProtocol } from '../lib/protocol/legacy/index.js';
import { Server, Stage } from '../lib/index.js';

new Server()
    .registerStage(new Stage('main').start(50))
    .registerProtocol(new LegacyProtocol());

console.log('Game server started');
