import { promises, existsSync, mkdirSync, renameSync } from "fs";
import { resolve as pathResolve, resolve } from "path";
import { AugmentedFile, FileCluster } from "types/custom";
import { Logger } from "../utils/logger";
import { addZ } from "./time";

/**
 * Given the path of a folder, return all the files in it (it will ignore folders) 
 * as AugmentedFiles[] 
 */
export async function extractFiles(folderPath: string): Promise<AugmentedFile[]> {

  const dirents = await promises.readdir(folderPath, { withFileTypes: true });

  const fileDirents = dirents.filter(d => !d.isDirectory() );

  const augmentedFilePromises = fileDirents.map(async dirent => {

    const file: string = pathResolve(folderPath, dirent.name);
    // https://www.geeksforgeeks.org/node-js-fspromises-stat-method/
    const stat = await promises.stat(file);

    // const dates = [ stat.birthtime, stat.atime, stat.mtime, stat.ctime ]
    // const mintime = new Date(Math.min.apply(null,dates));
    const birthtime = stat.birthtime;
    const birthday = `${birthtime.getFullYear()}.${addZ(birthtime.getMonth() + 1)}.${addZ(birthtime.getDate())}`;

    const modtime = stat.mtime;
    const modday = `${modtime.getFullYear()}.${addZ(modtime.getMonth() + 1)}.${addZ(modtime.getDate())}`;

    const result: AugmentedFile = {
      file,
      stat,
      meta: { 
        folder: folderPath,
        name: dirent.name,
        modday,
        modtime,
        birthday, 
        birthtime,
      }
    };

    return result;

  })

  const augmentedFiles = await Promise.all(augmentedFilePromises);

  return augmentedFiles;

}

function createFolderSync(newFolder: string) {
  if (!existsSync(newFolder)) {
    mkdirSync(newFolder);
  }
}

function moveFilesSync(destinationFolder: string, files: AugmentedFile[]) {
  files.forEach(f => {
    const oldName = f.file;
    const newName = pathResolve(destinationFolder, f.meta.name);
    renameSync(oldName, newName);
  })
}

const logger = new Logger("test-run");

export function createFolderAndMove(options: { mainFolder: string, subfolderName: string, cluster: FileCluster, testRun: boolean }) {
  // New subfolder name
  const newFolderPath = resolve(options.mainFolder, options.subfolderName);
  if (options.testRun) {
    // const fileList = options.cluster.items.map(f => f.meta.name).join(", ");
    // logger.info(`Subfolder ${newFolderPath} would be created with the following files: ${fileList}.`);
    logger.info(`Subfolder ${newFolderPath} would be created with ${options.cluster.items.length} file(s) in it.`);
  } else {
    logger.debug(`Creating folder ${newFolderPath} (${options.cluster.items.length} file(s) will be moved inside).`);
    // Actually create the folder
    createFolderSync(newFolderPath);
    // move all the data
    moveFilesSync(newFolderPath, options.cluster.items);
  }
}