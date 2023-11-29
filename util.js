const fs = require('fs');
const path = require('path');

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

function traverseFolderAndReplaceString(folderPath, searchString, replaceString) {
  const files = fs.readdirSync(folderPath);
  const reg = new RegExp(searchString, 'g');

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 递归遍历子文件夹
      traverseFolderAndReplaceString(filePath, searchString, replaceString);
      if (reg.test(file)) {
        fs.renameSync(filePath, path.join(folderPath, file.replace(reg, replaceString)))
      }
    } else if (stats.isFile()) {
      // 读取文件内容
      let fileContent = fs.readFileSync(filePath, 'utf8');

      // 替换字符串
      fileContent = fileContent.replace(reg, replaceString);

      // 写入替换后的内容
      fs.writeFileSync(filePath, fileContent, 'utf8');
    }
  });
}

module.exports = {
  copyFolderSync,
  traverseFolderAndReplaceString
}