const hyperquest = require("hyperquest");
const https = require("https");
const unpack = require("tar-pack").unpack;
const fs = require("fs-extra");
const path = require("path");
const root = process.cwd();
const tempFolderName = "tempFolder";
const chalk = require("chalk");
const log = console.log;
async function run() {
  try {
    log(chalk.bgMagenta("start sync"));
    const packageURL = await getTemplateUrl();
    log(chalk.magenta(`repo address: ${packageURL}`));
    if (!checkIsInRoot()) {
      return;
    }
    const templatePath = path.join(root, "sync-script", tempFolderName);
    if (!fs.existsSync(templatePath)) {
      let stream;
      if (/^http/.test(packageURL)) {
        log(chalk.green("pulling template..."));
        stream = hyperquest(packageURL);
      }
      log(chalk.green("unpack template file..."));
      await extractStream(
        stream,
        path.join(root, "sync-script", tempFolderName),
      );
    }

    copyFiles(templatePath);

    fs.removeSync(path.join(root, "sync-script", tempFolderName));
  } catch (e) {
    chalk.red(e);
  }
}
// 复制配置文件
function copyFiles(templatePath) {
  const fileNames = [
    ".eslintrc.js",
    ".prettierrc",
    ".prettierignore",
    ".stylelintrc.json",
    "tsconfig.json",
  ];
  for (let filename of fileNames) {
    const filePath = path.join(templatePath, "template", filename);
    if (fs.existsSync(filePath)) {
      fs.copySync(filePath, path.join(root, filename));
    } else {
      log(chalk.bgYellow(filename + " not exist in template"));
    }
  }
}
// 解压
function extractStream(stream, dest) {
  return new Promise((resolve, reject) => {
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
    throw new Error("package不存在");
  }
  return true;
}

function getTemplateUrl() {
  // 返回的json信息中包含版本号
  const url = "https://registry.npmjs.org/cra-template-zh";
  return new Promise((resolve, reject) => {
    https
      .get(url, resp => {
        let data = "";
        resp.on("data", chunk => {
          data += chunk;
        });
        resp.on("end", () => {
          const info = JSON.parse(data);
          const version = info && info["dist-tags"] && info["dist-tags"].latest;
          const url = `https://registry.npmjs.org/cra-template-zh/-/cra-template-zh-${version}.tgz`;
          resolve(url);
        });
      })
      .on("error", err => {
        reject(err.message);
      });
  });
}
run();
