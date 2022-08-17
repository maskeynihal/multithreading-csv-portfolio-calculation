import { createWriteStream } from "fs";
import { Transform } from "stream";

export const fileSplitter = (options: { totalFiles: number }) => {
  let totalFilesCreated = 0;

  const { totalFiles } = options;

  const transformer = new Transform();

  let trailing: any;
  let headers: any;

  transformer._transform = (data, encoding, cb) => {
    totalFilesCreated++;
    let firstData = data;

    const write = createWriteStream(
      process.cwd() + ["", "data", "tmp", `${totalFilesCreated}.csv`].join("/")
    );

    if (trailing) {
      const newBuffer = Buffer.concat([headers, trailing, data]);

      if (totalFilesCreated >= totalFiles) {
        firstData = newBuffer;
        trailing = null;
      } else {
        firstData = newBuffer.slice(0, newBuffer.lastIndexOf("\n"));
        trailing = newBuffer.slice(newBuffer.lastIndexOf("\n"));
      }
    } else {
      if (totalFilesCreated >= totalFiles) {
        firstData = data;
        trailing = null;
      } else {
        headers = data.slice(0, data.indexOf("\n"));
        firstData = data.slice(0, data.lastIndexOf("\n"));
        trailing = data.slice(data.lastIndexOf("\n"));
      }
    }
    write.write(firstData);

    cb(null, firstData);
  };

  return transformer;
};
