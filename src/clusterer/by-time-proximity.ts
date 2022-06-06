import { createFolderAndMove, extractFiles } from "../utils/files";
import { Logger } from "../utils/logger";
import { AugmentedFile } from "types/custom";
import { ClusterManager } from "./ClusterManager";
import { addZ } from "../utils/time";
import { compact } from "./clusterCompactor";
import { markOnlyDayEvent } from "./singleDayEventIdenfier";
import { yesnoQuestion } from "../utils/terminal";

const logger = new Logger("time-cluster");

const __CODE_a__ = 'a'.charCodeAt(0);

// Cannot use ":", since MacOS would complain, thus I use "." instead
function getWatchTime(file: AugmentedFile) {
  return `${addZ(file.stat.mtime.getHours())}.${addZ(file.stat.mtime.getMinutes())}`;
}

export async function clusterByTimeProximity(opt: { mainFolder: string, clusterGap: number, compactionSize: number, forceYes: boolean, testRun?: boolean }) {

    // logger.info(`Time proximity strategy invoked with the following options: `, opt);
    const files: AugmentedFile[] = await extractFiles(opt.mainFolder);

    logger.info(`${files.length} items found in the folder.`);

    // Ascending order (newest last)
    files.sort((a, b) => a.stat.mtime.getTime() - b.stat.mtime.getTime());

    const clusterManager = new ClusterManager({ files, clusterGap: opt.clusterGap });

    const clusters = opt.compactionSize > 0 ? compact(clusterManager.clusters, opt.compactionSize) : clusterManager.clusters;

    // If a day only has one event (e.g. only "02.02.2022a", mark it to avoid the "a" in the end)
    markOnlyDayEvent(clusters);

    clusters.forEach(c => {

      const clusterDaySequence = `${c.day}${c.onlyDayEvent ? "" : String.fromCharCode(__CODE_a__ + c.seq)}`;

      let filesCoverage;

      if (c.items.length > 1) {
        const start = getWatchTime(c.items[0]);
        const end = getWatchTime(c.items[c.items.length - 1]);
        filesCoverage = `${c.items.length} files, ${start} to ${end}`;
      } else {
        filesCoverage = `1 file, at ${getWatchTime(c.items[0])}`;
      }

      // Too much debug if it's already a test run
      logger.debug(`Identifed cluster: ${clusterDaySequence} (${filesCoverage})`);

    });

    const goAhead = opt.forceYes || await yesnoQuestion("Would you like to continue with the tidy up?");

    if (goAhead) {

      logger.info("Proceeding to move files into subfolders.")

      // It's a bit of copy / paste, soz
      clusters.forEach(c => {
        const clusterDaySequence = `${c.day}${c.onlyDayEvent ? "" : String.fromCharCode(__CODE_a__ + c.seq)}`;
        const subfolderName = `${clusterDaySequence} (${c.items.length})`;
        createFolderAndMove({ mainFolder: opt.mainFolder, subfolderName, cluster: c, testRun: opt.testRun });
      });

      logger.info("All done!");

    } else {
      logger.info("Goodbye!")
    }

}

