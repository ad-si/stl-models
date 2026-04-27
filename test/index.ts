import * as fs from "fs";
import * as path from "path";
import assert from "assert";
import readdirp from "readdirp";

import * as stlModels from "../source/index";

const numberOfModels = 35;
const rootPath = path.resolve(__dirname, "..");

interface TestedFile {
  name: string;
  fullPath: string;
  startsWithSolid: boolean;
}

const checkLength = (models: stlModels.StlModel[]): void => {
  assert.equal(models.length, numberOfModels);
};

describe("STL Models", () => {
  let testedFiles: TestedFile[] = [];

  before((done) => {
    readdirp(
      { root: rootPath, fileFilter: "*.stl" },
      () => {
        // Do nothing
      },
      (error, result) => {
        if (error) throw error;

        testedFiles = result.files.map((file) => {
          const buffer = Buffer.alloc(5);

          const fileDescriptor = fs.openSync(file.fullPath, "r");

          fs.readSync(fileDescriptor, buffer, 0, 5, 0);

          return {
            name: file.name,
            fullPath: file.fullPath,
            startsWithSolid: buffer.toString("utf-8") === "solid",
          };
        });

        done();
      },
    );
  });

  it('All .ascii.stl files start with "solid"', () => {
    testedFiles
      .filter((file) => /.*ascii\.stl/.test(file.name))
      .forEach((file) => {
        assert(file.startsWithSolid, file.name);
      });
  });

  it('All .bin.stl files do not start with "solid"', () => {
    testedFiles
      .filter(
        (file) =>
          /.*bin\.stl/.test(file.name) && file.name !== "wrongHeader.bin.stl",
      )
      .forEach((file) => {
        assert.equal(
          file.startsWithSolid,
          false,
          `File ${file.name} should not start with 'solid'`,
        );
      });
  });

  it("Returns a promise which resolves to a list of STL model objects", () => {
    return stlModels.getObjects().then((models) => {
      const absolutePath = models[0].absolutePath;
      const relativePath = models[0].absolutePath;

      checkLength(models);
      assert(models[0].filename);
      assert(relativePath, models[0].relativePath + " is no relative path");
      assert(
        absolutePath && absolutePath[0] === "/",
        models[0].absolutePath + " is no absolute path",
      );
    });
  });

  it("Returns a promise which resolves to the file content of an STL model", () => {
    return stlModels
      .getByPath("polytopes/tetrahedron.ascii.stl")
      .then((contentBuffer) => {
        return /^solid tetrahedron/.test(contentBuffer.toString());
      });
  });

  it("Returns a readable STL stream", (done) => {
    const relativePath = "polytopes/tetrahedron.ascii.stl";
    const tempFilePath = path.join(__dirname, "temp.stl");
    const writeStream = fs.createWriteStream(tempFilePath);

    stlModels.getReadStreamByPath(relativePath).pipe(writeStream);

    writeStream.on("error", () => done);
    writeStream.on("finish", () => {
      assert.equal(
        String(fs.readFileSync(path.join(rootPath, relativePath))),
        String(fs.readFileSync(tempFilePath)),
      );
      fs.unlinkSync(tempFilePath);
      done();
    });
  });

  it("getByPath rejects when the path does not exist", () => {
    return stlModels.getByPath("polytopes/does-not-exist.stl").then(
      () => {
        throw new Error("Expected promise to be rejected");
      },
      (error: Error) => assert(/Invalid path/.test(error.message)),
    );
  });

  it("getByPath rejects when the path escapes the package", () => {
    return stlModels.getByPath("../etc/passwd").then(
      () => {
        throw new Error("Expected promise to be rejected");
      },
      (error: Error) => assert(/Invalid path/.test(error.message)),
    );
  });

  it("getByPath rejects when the path is empty", () => {
    return stlModels.getByPath("").then(
      () => {
        throw new Error("Expected promise to be rejected");
      },
      (error: Error) => assert(/Invalid path/.test(error.message)),
    );
  });

  it("getReadStreamByPath throws when the path does not exist", () => {
    assert.throws(
      () => stlModels.getReadStreamByPath("polytopes/does-not-exist.stl"),
      /Invalid path/,
    );
  });

  it("getReadStreamByPath throws when the path escapes the package", () => {
    assert.throws(
      () => stlModels.getReadStreamByPath("../etc/passwd"),
      /Invalid path/,
    );
  });

  it("getReadStreamByPath throws when the path is empty", () => {
    assert.throws(() => stlModels.getReadStreamByPath(""), /Invalid path/);
  });
});
