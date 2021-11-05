#!/usr/bin/env node
import { argv } from 'process';

import { Command, InvalidArgumentError } from 'commander';

import { logger as parentLogger } from '../lib/log/index.js';
import { ConsoleLoggerBackend } from '../lib/log/console.js';
import { LegacyProtocol } from '../lib/protocol/legacy/index.js';
import { Server, Stage, VERSION } from '../lib/index.js';
import { Protocol } from '../lib/protocol/index.js';

function keyValSplit(composite: string, delimiter: string) {
    let splitIdx = composite.indexOf(delimiter);

    return splitIdx === -1 ? [composite, null] :
        [composite.slice(0, splitIdx), composite.slice(splitIdx + delimiter.length)];
}

let protocols: (new () => Protocol)[] = [];

function parseProtocolOption(value: string, previous: string) {
    let [name, rawOpts] = keyValSplit(value, '=');
    let opts = rawOpts != null ? rawOpts.split(',') : [];

    switch (name) {
        case 'legacy':
            protocols.push(LegacyProtocol.bind(null, ...opts));
            break;
        default:
            throw new InvalidArgumentError(`Unsupported protocol ${name}`);
    }

    return value;
}

const program = new Command()
    .version(VERSION)
    .option('-p, --protocol <PROTOCOL>', 'protocol and associated options',
        parseProtocolOption, 'legacy=http://localhost:3000')
    .parse();

const options = program.opts();
const logger = parentLogger.sub('ServerCli');

parentLogger.backends.push(new ConsoleLoggerBackend());

let server = new Server()
    .registerStage(new Stage('main').start(50));

if (!protocols.length)
    parseProtocolOption(options.protocol, options.protocol);

for (let protocol of protocols)
    server.registerProtocol(new protocol());

logger.info('Ready');
