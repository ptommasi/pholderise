import { FileCluster } from "types/custom";

export function markOnlyDayEvent(clusters: FileCluster[]) {

  for (let i = 0; i < clusters.length; i++) {

    const thisCluster = clusters[i];

    if (thisCluster.seq > 0) {
      thisCluster.onlyDayEvent = false;
    } else {
      const hasNext = i < clusters.length - 1;
      if (!hasNext) {
        // Last element and seq is 0
        thisCluster.onlyDayEvent = true;
      } else {
        const nextCluster = clusters[i + 1];
        // If the next cluster is the same day, it's not the only event of the day
        thisCluster.onlyDayEvent = thisCluster.day !== nextCluster.day;
      }
    }

  }

  return clusters;

}