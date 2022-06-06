import { Logger } from "../utils/logger";
import { AugmentedFile, FileCluster } from "types/custom";
import { __1_HOUR__ } from "../utils/time";

const logger = new Logger("cluster-manager");

const CLUSTER_GAP = 2 * __1_HOUR__;

/** Change this function if you are not interested into modified day
 *  but something else */
function getDayString(file: AugmentedFile): string {
  return file.meta.modday;
}

/** Change this function if you are not interested into modified day
 *  but something else */
function getTime(file: AugmentedFile): number {
  return file.stat.mtime.getTime();
}

// WARNING: Files must be pushed **in order** (either ascending or descending)
// Example usages:
// Example 1:
//    const clusterManager = new ClusterManager();
//    files.forEach(f => clusterManager.push(f));
// Example 2:
//    const clusterManager = new ClusterManager({ files });
// Example 3:
//    const clusterManager = new ClusterManager();
//    clusterManager.pushAll(files);
export class ClusterManager {

  clusters: FileCluster[] = [];

  clusterGap = CLUSTER_GAP;

  public constructor(options?: { files?: AugmentedFile[], clusterGap?: number }) {
    // WARN: clusterGap has to be set first (it's used in pushAll)
    if (options?.clusterGap) {
      this.clusterGap = options.clusterGap;
    }
    if (options?.files) {
      this.pushAll(options.files);
    }
  }

  private isCloseToLast = (file: AugmentedFile) => {

    if (this.clusters.length == 0) {
      return false;
    }

    const lastCluster = this.clusters[this.clusters.length - 1];

    if (lastCluster.items.length == 0) {
      logger.warn("Non empty cluster has an empty item list?");
    }

    const lastFile = lastCluster.items[lastCluster.items.length - 1];

    const lastTime = getTime(lastFile);
    const thisTime = getTime(file);

    // In case the order of the files change (e.g. time ascending vs descending)
    const timeDiff = Math.abs(lastTime - thisTime);

    return timeDiff < this.clusterGap;

  }

  private createClusterAndPush = (file: AugmentedFile) => {

    let seq = 0;

    if (this.clusters.length > 0) {
        const lastCluster = this.clusters[this.clusters.length - 1];
        // If the previous cluster is from the same day, just increase the seq number
        if (lastCluster.day === getDayString(file)) {
          seq = lastCluster.seq + 1;
        }
    }

    const day = getDayString(file);

    const items = [ file ];

    this.clusters.push({ items, day, seq})

  }

  private pushIntoPreviousCluster = (file: AugmentedFile) => {

    if (this.clusters.length == 0) {
      logger.error("Pushing into an empty clusters array?");
    }

    const lastCluster = this.clusters[this.clusters.length - 1];

    if (lastCluster.items.length == 0) {
      logger.warn("Pushing into a cluster with empty items?");
    }

    lastCluster.items.push(file);

  }

  public push = (file: AugmentedFile) => {
    if (this.isCloseToLast(file)) {
      this.pushIntoPreviousCluster(file);
    } else {
      this.createClusterAndPush(file);
    }
  }

  public pushAll = (files: AugmentedFile[]) => {
    files.forEach(f => this.push(f));
  }

}