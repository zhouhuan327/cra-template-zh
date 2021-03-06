const hyperquest = require("hyperquest");
const https = require("https");
const unpack = require("tar-pack").unpack;
const fs = require("fs-extra");
const path = require("path");
const tempFolderName = "tempFolder";
const root = process.cwd();
const log = {
  green: content => {
    console.log(`\x1B[32m${content}\x1B[0m`);
  },
  red: content => {
    console.log(`\x1B[31m${content}\x1B[0m`);
  },
};

async function run() {
  try {
    const packateInfo = getPactageInfo();
    const templatePath = path.join(root, "sync-script", tempFolderName);

    if (!checkDeps(packateInfo)) return;

    if (fs.existsSync(templatePath)) {
      fs.removeSync(path.join(root, "sync-script", tempFolderName));
    }

    const templateURL = await getTemplateUrl();
    log.green(`[1/4] 📌 get npm address: ${templateURL}`);

    const stream = hyperquest(templateURL);
    log.green(`[2/4] 🔍 Fetching package...`);

    await extractStream(stream, templatePath);
    log.green(`[3/4] ⚡️ unpack file...`);

    // 这里不知道为什么直接执行会有几率找不到文件
    setTimeout(() => {
      log.green("[4/4] 🔨 copy files...");
      copyFiles(templatePath, packateInfo);
      fs.removeSync(path.join(root, "sync-script", tempFolderName));
    }, 100);
  } catch (e) {
    log.red(e);
  }
}
// 复制配置文件
function copyFiles(templatePath, packateInfo) {
  const deps = Object.keys(packateInfo.dependencies || {});
  const fileNames = [
    ".eslintrc.js",
    ".prettierrc",
    ".prettierignore",
    ".stylelintrc.json",
  ];
  if (deps.includes("typescript")) {
    fileNames.push("tsconfig.json");
  }
  for (let filename of fileNames) {
    const filePath = path.join(templatePath, "template", filename);
    if (fs.existsSync(filePath)) {
      fs.copySync(filePath, path.join(root, filename));
      log.green(` - copy ${filename}`);
    } else {
      log.red(filename + "not exist in template");
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
function checkDeps(packageInfo) {
  const deps = Object.assign(
    packageInfo.dependencies,
    packageInfo.devDependencies,
  );
  const depsArray = Object.keys(deps);
  const notInstalled = [];
  const requireDeps = [
    "eslint",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "eslint-plugin-react-hooks",
    "husky",
    "lint-staged",
    "prettier",
    "prettier-stylelint",
    "stylelint",
    "stylelint-config-idiomatic-order",
    "stylelint-config-recommended",
    "stylelint-config-styled-components",
    "stylelint-order",
    "stylelint-prettier",
    "stylelint-processor-styled-components",
  ];
  // 找到缺了哪些包
  for (let dep of requireDeps) {
    if (!depsArray.includes(dep)) {
      notInstalled.push(dep);
    }
  }
  if (notInstalled.length > 0) {
    log.red("缺少依赖");
    log.red(`请运行 yarn add ${notInstalled.join(" ")} -D`);
    return false;
  }
  return true;
}

function getPactageInfo() {
  if (!fs.existsSync(path.join(root, "package.json"))) {
    throw new Error("package.json not found");
  }
  const obj = require(path.join(root, "package.json"));
  return obj;
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
