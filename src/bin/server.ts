#!/usr/bin/env node
import { logger as parentLogger } from '../lib/log/index.js';
import { ConsoleLoggerBackend } from '../lib/log/console.js';
import { LegacyProtocol } from '../lib/protocol/legacy/index.js';
import { Server, Stage } from '../lib/index.js';

const logger = parentLogger.sub('ServerCli');
parentLogger.backends.push(new ConsoleLoggerBackend());

new Server()
    .registerStage(new Stage('main').start(50))
    .registerProtocol(new LegacyProtocol());

logger.info('Ready');
