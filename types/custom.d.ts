import { Stats } from "fs";

export interface AugmentedFile {
  file: string;
  stat: Stats;
  meta: {
    folder: string;
    name: string;
    modday: string;
    modtime: Date;
    birthday: string;
    birthtime: Date;
  };
}

interface FileCluster {
  items: AugmentedFile[],
  day: string;
  seq: number;
  onlyDayEvent?: boolean;
}