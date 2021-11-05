#!/usr/bin/env node
import { Command } from 'commander';

import { logger as parentLogger } from '../lib/log/index.js';
import { ConsoleLoggerBackend } from '../lib/log/console.js';
import { LegacyProtocol } from '../lib/protocol/legacy/index.js';
import { Server, Stage, VERSION } from '../lib/index.js';

const program = new Command()
    .version(VERSION)
    .parse();

const options = program.opts();
const logger = parentLogger.sub('ServerCli');

parentLogger.backends.push(new ConsoleLoggerBackend());

new Server()
    .registerStage(new Stage('main').start(50))
    .registerProtocol(new LegacyProtocol());

logger.info('Ready');
