const hyperquest = require("hyperquest");
const https = require("https");
const unpack = require("tar-pack").unpack;
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const log = console.log;
const tempFolderName = "tempFolder";
const root = process.cwd();

async function run() {
  try {
    const templatePath = path.join(root, "sync-script", tempFolderName);
    if (!fs.existsSync(path.join(root, "package.json"))) {
      throw new Error("package.json not found");
    }
    if (fs.existsSync(templatePath)) {
      fs.removeSync(path.join(root, "sync-script", tempFolderName));
    }

    const packageURL = await getTemplateUrl();
    log(chalk.green(`[1/4] 📌 get npm address: ${packageURL}`));

    const stream = hyperquest(packageURL);
    log(chalk.green(`[2/4] 🔍 Fetching package...`));

    await extractStream(stream, templatePath);
    log(chalk.green(`[3/4] ⚡️ unpack file...`));

    // 这里不知道为什么直接执行会有几率找不到文件
    setTimeout(() => {
      log(chalk.green("[4/4] 🔨 copy files..."));
      copyFiles(templatePath);
      fs.removeSync(path.join(root, "sync-script", tempFolderName));
    }, 100);
  } catch (e) {
    log(chalk.red(e));
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
      log(filename + "not exist in template");
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
        }
      }),
    );
    stream.on("end", () => {
      resolve();
    });
  });
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
