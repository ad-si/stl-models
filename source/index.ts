import * as fs from "fs";
import * as path from "path";
import findit from "findit2";

const rootPath = path.resolve(__dirname, "..");

export interface StlModel {
  filename: string;
  absolutePath: string;
  relativePath: string;
}

const validatePath = (filePath: string): string => {
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("Invalid path: path must be a non-empty string");
  }

  const absolutePath = path.resolve(rootPath, filePath);

  if (absolutePath.indexOf(rootPath + path.sep) !== 0) {
    throw new Error(`Invalid path: "${filePath}" is outside of the package`);
  }

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Invalid path: "${filePath}" does not exist`);
  }

  return absolutePath;
};

export const getObjects = (): Promise<StlModel[]> => {
  return new Promise((resolve, reject) => {
    const finder = findit(rootPath);
    const files: StlModel[] = [];

    finder.on("error", (error) => {
      reject(error);
    });

    finder.on("directory", (directory, _stat, stop) => {
      const base = path.basename(directory);

      if (["node_modules", ".git", "source", "test"].includes(base)) {
        stop();
      }
    });

    finder.on("file", (file) => {
      if (/stl$/.test(file)) {
        files.push({
          filename: path.basename(file),
          absolutePath: file,
          relativePath: file.slice(rootPath.length + 1),
        });
      }
    });

    finder.on("end", () => {
      resolve(files);
    });
  });
};

export const getByPath = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    let absolutePath: string;
    try {
      absolutePath = validatePath(filePath);
    } catch (error) {
      reject(error);
      return;
    }

    fs.readFile(absolutePath, (error, fileContent) => {
      if (error) {
        reject(error);
      } else {
        resolve(fileContent);
      }
    });
  });
};

export const getReadStreamByPath = (filePath: string): fs.ReadStream => {
  const absolutePath = validatePath(filePath);
  return fs.createReadStream(absolutePath);
};
