#!/usr/bin/env -S TS_BLANK_SPACE_EMIT=false node --import ts-blank-space/register
import '@endo/init/legacy.js';
import { initProgram } from './cli.js';

const program = initProgram();
program.parse();
