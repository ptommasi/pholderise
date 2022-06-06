import { FileCluster } from "types/custom";

// before compactionSize, it was this:
// const OWN_EVENT_SIZE = 12;

export function compact(clusters: FileCluster[], compactionSize: number) {

  const compactedClusters: FileCluster[] = [];

  for (let i = 0; i < clusters.length; i++) {

    const currentCluster = clusters[i];

    // This cluster is too small, merge with the next small ones
    if (currentCluster.items.length < compactionSize) {

      const newCluster: FileCluster = {
        items: [], day: currentCluster.day, seq: currentCluster.seq
      }

      let j = i;

      while (j < clusters.length && clusters[j].items.length < compactionSize && clusters[j].day === currentCluster.day) {
        newCluster.items.push(...clusters[j].items);
        i = j;
        j++;
      }

      compactedClusters.push(newCluster);
  
    }

    // Cluster is big enough, keep it as it is
    else {
      compactedClusters.push({...currentCluster});
    }

  } // end of for loop

  return fixSeqNumber(compactedClusters);

}

function fixSeqNumber(clusters: FileCluster[]) {
  for (let i = 1; i < clusters.length; i++) {
    const thisCluster = clusters[i];
    const prevCluster = clusters[i - 1];
    if (thisCluster.day === prevCluster.day) {
      thisCluster.seq = prevCluster.seq + 1;
    }
  }
  return clusters;
} 
