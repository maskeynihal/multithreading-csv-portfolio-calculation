import csvParser from "csv-parser";
import {
  createWriteStream,
  existsSync,
  createReadStream,
  writeFileSync,
  readFileSync,
} from "fs";

class Cache {
  public filePath: string;
  public cacheContent: Map<string, any>;

  constructor({ filePath }: { filePath: string }) {
    this.filePath = filePath;
    this.cacheContent = new Map();
    this.readCacheContent();
    // this.createCacheFile();
  }

  public createCacheFile = () => {
    const cacheFile = createWriteStream(this.filePath);
    cacheFile.write("");
    cacheFile.end();
  };

  public readCacheContent = async () => {
    if (!existsSync(this.filePath)) {
      this.writeCacheContent();
    }

    const content = readFileSync(this.filePath);

    this.cacheContent = new Map(
      Object.entries(JSON.parse(content.toString() || "{}"))
    );
  };

  public writeCacheContent = async () => {
    writeFileSync(
      this.filePath,

      JSON.stringify(Object.fromEntries(this.cacheContent))
    );
  };

  public set = (
    key: string,
    value: any,
    option: { ttl: number } = { ttl: 5 * 60 }
  ) => {
    this.cacheContent.set(key, {
      expiresOn: Date.now() + option.ttl * 1000,
      value: value,
    });

    this.writeCacheContent();
  };

  public get = (key: string) => {
    this.readCacheContent();

    const { expiresOn, value } = this.cacheContent.get(key) || {};

    if (!expiresOn || Date.now() > expiresOn) {
      return null;
    }

    return value;
  };
}

export default Cache;
