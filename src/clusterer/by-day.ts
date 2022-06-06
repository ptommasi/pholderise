import { extractFiles, createFolderAndMove } from "../utils/files";
import { Logger } from "../utils/logger";
import { AugmentedFile, FileCluster } from "types/custom";
import { yesnoQuestion } from "../utils/terminal";

const logger = new Logger("day-cluster");

// Note, this is old logic adapted to work with FileCluster,
// it waste a bit of resources, but "oh well"
function groupByDay(files: AugmentedFile[]) {

  const days = new Map<string, AugmentedFile[]>();

  files.forEach(f => {
    const key = f.meta.modday;
    if(!days.has(key)) {
    days.set(key, []);
    }
    days.get(key).push(f);
  });

  return days;

}

export async function clusterByDay(opt: { mainFolder: string, minFilesCount: number, forceYes: boolean, testRun?: boolean}) {

    logger.debug(`Starting to sort files in '${opt.mainFolder}'.`);
    const files = await extractFiles(opt.mainFolder);
    const days = groupByDay(files);

    logger.info(`${files.length} file(s) belonging to ${days.size} different days found in the folder.`);

    const goAhead = opt.forceYes || await yesnoQuestion("Would you like to continue with the tidy up?");

    if (goAhead) {

      logger.debug("Proceeding to move files into subfolders.");

      [...days.keys()].forEach(day => {
    
        // console.log(`${d} => ${days.get(d).length} files.`);
        const filesCount = days.get(day).length;

        if (filesCount >= opt.minFilesCount) {
          const subfolderName = `${day} (${filesCount})`;
          const cluster: FileCluster = {
            day, 
            seq: 0,
            items: days.get(day),
            // Always true, there is only a folder per day
            onlyDayEvent: true
          }
          createFolderAndMove({mainFolder: opt.mainFolder, subfolderName, cluster, testRun: opt.testRun });
        }

      });

      logger.info("All done!");

    } else {
      logger.info("Goodbye!");
    }

}