#!/usr/bin/env node
'use strict';

// const wtf = require("wtfnode");
// const why = require('why-is-node-running');

import { Logger } from "./utils/logger";
import { clusterByDay } from "./clusterer/by-day";
import { clusterByTimeProximity } from "./clusterer/by-time-proximity";
import { Command, Option } from 'commander';
import { commanderParseInt } from "./utils/parser";
import { __1_HOUR__ } from "./utils/time";

const logger = new Logger("main");

(async () => {

  const program = new Command();

  const strategyOption = new Option('-s, --strategy <strategy>', 'stategy to use')
                                .choices(["time-proximity", "by-day"])
                                .default("time-proximity");

  const minFilesCountOption = new Option(
                                '-m, --min-files-count <min files count>',
                                '**only for by-day strategy** minimum number of files required to move into new subfolder (0 to always move)'
                              )
                              .argParser(commanderParseInt)
                              .default(0, "always move");

  const compactionOption = new Option(
                            '-c, --compaction-size <compaction size>',
                            '**only for time-proximity strategy** during the same day, if subfolder are smaller than provided value, merge them (0 to disable)'
                          )
                          .argParser(commanderParseInt)
                          .default(12, "folder with less than 12 files will be merged");


  const clusterGapOption = new Option(
                            '-g, --cluster-gap <cluster gap>',
                            '**only for time-proximity strategy** files more than <g> milliseconds apart belong to a new cluster (a new subfolder)'
                          )
                          .argParser(commanderParseInt)
                          .default(2 * __1_HOUR__, "2 hours");

  const testrunOption = new Option(
                            '-t, --test-run',
                            "do not move files, only show the plan"
                        )
                        .default(false, "move files into new subfolders");

  const forceYesOption = new Option(
                          '-y, --force-yes',
                          "move files without asking for confirmation"
                      )
                      .default(false, "ask for confirmation");


  program
    .name('pholderise')
    .description('CLI to tidy up files into new subfolders, based on timestamp')
    .version('0.42.0')
    .argument('<folder>', 'folder to target')
    .allowExcessArguments(false)
    .addOption(strategyOption)
    .addOption(forceYesOption)
    .addOption(testrunOption)
    .addOption(minFilesCountOption)
    .addOption(compactionOption)
    .addOption(clusterGapOption)
    .showSuggestionAfterError();

  program.parse();

  const options = program.opts();

  const mainFolder = program.processedArgs[0];

  logger.info(`Targeting ${mainFolder} with options: `, options);

  if (options.strategy === "time-proximity") {
    await clusterByTimeProximity({ 
      mainFolder,
      forceYes: options.forceYes,
      clusterGap: options.clusterGap,
      compactionSize: options.compactionSize,
      testRun: options.testRun
    });
  } else if (options.strategy === "by-day") {
    await clusterByDay({
      mainFolder,
      forceYes: options.forceYes,
      minFilesCount: options.minFilesCount,
      testRun: options.testRun
    });
  }

  // Useful for debug, if needed:
  // wtf.dump();
  // why();

})();
