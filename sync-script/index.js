const hyperquest = require("hyperquest");
const unpack = require("tar-pack").unpack;
const fs = require("fs-extra");
const path = require("path");
const root = process.cwd();
const tempFolderName = "temp";
const chalk = require("chalk");
// npm下载地址,不是github地址
const packageURL =
  "https://registry.npmjs.org/cra-template-redux/-/cra-template-redux-1.0.2.tgz";
async function run() {
  console.log(chalk.bgGreen("current template url:" + packageURL));
  if (!checkIsInRoot()) {
    return;
  }
  const templatePath = path.join(root, "sync-script", tempFolderName);
  if (!fs.existsSync(templatePath)) {
    let stream;
    if (/^http/.test(packageURL)) {
      console.log(chalk.green("pulling template..."));
      stream = hyperquest(packageURL);
    }
    await extractStream(stream, path.join(root, "sync-script", tempFolderName));
  }

  copyFiles(templatePath);

  fs.removeSync(path.join(root, "sync-script", tempFolderName));
}
function copyFiles(templatePath) {
  const fileNames = [
    ".eslintrc.js",
    ".prettierrc",
    ".prettierrcignore",
    ".stylelintrc.json",
    "tsconfig.json",
  ];
  for (let filename of fileNames) {
    const fileExists = fs.existsSync(path.join(templatePath, filename));
    if (fileExists) {
      fs.copySync(path.join(templatePath, filename), path.join(root, filename));
    } else {
      console.log(chalk.bgYellow(filename + " not exist in template"));
    }
  }
}
function extractStream(stream, dest) {
  return new Promise((resolve, reject) => {
    console.log(chalk.green("unpack template file..."));
    stream.pipe(
      unpack(dest, err => {
        if (err) {
          reject(err);
        } else {
          resolve(dest);
        }
      }),
    );
  });
}
function checkIsInRoot() {
  const packageExists = fs.existsSync(path.join(root, "package.json"));
  if (!packageExists) {
    console.log(chalk.bgRed("package不存在"));
    throw new Error("package不存在");
  }
  return true;
}

run();
