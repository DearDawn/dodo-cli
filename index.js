#!/usr/bin/env node

const program = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const { copyFolderSync, traverseFolderAndReplaceString } = require('./util')
const { simpleGit } = require('simple-git');

const templateRepoUrl = 'https://gitclone.com/github.com/DearDawn/dodo-template.git';

program.version('0.0.1', '-v, --version')

program
  .command('info')
  .description('关于 cli 工具')
  .action(() => {
    console.log('我是呆呆的 cli 工具!');
  });


program
  .command('create <project>')
  .description('create a new project')
  .action((project) => {
    const _project = `.dodo_${project}`
    inquirer.prompt([
      {
        type: 'input',
        name: 'project_name',
        message: 'Project name:',
        default: project,
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          {
            name: "react-multi-page-app",
            value: "react-multi-page-app",
            short: "react 多页应用"
          },
        ]
      }
    ]).then(async (answers) => {
      console.log('[dodo] ', 'answers', answers);
      const { template, project_name } = answers
      const targetPath = path.join(process.cwd(), project_name);
      const tempPath = path.join(process.cwd(), `.temp_${project_name}`);
      const spinner = ora(`下载模板中：${template}`).start();

      if (fs.existsSync(targetPath) || fs.existsSync(tempPath)) {
        spinner.fail(chalk.red('文件夹已存在'))
        return;
      }

      // 克隆模板仓库到目标路径
      simpleGit().clone(templateRepoUrl, tempPath, (err) => {
        if (err) {
          spinner.fail(chalk.red('下载失败'))
          return;
        }

        spinner.text = '克隆模板成功！'

        const files = fs.readdirSync(tempPath);

        if (!files.includes(template)) {
          spinner.fail(chalk.red('找不到模板'))
          return;
        }

        const templatePath = path.join(tempPath, template);

        copyFolderSync(templatePath, targetPath)
        traverseFolderAndReplaceString(targetPath, template, project_name);
        fs.rmSync(tempPath, { recursive: true, force: true })
        spinner.succeed(chalk.green('项目初始化完成'));
      });
    }).catch(err => {
      console.log('[dodo] ', 'err', err)
    })
  })

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}