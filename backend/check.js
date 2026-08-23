const ts = require('./node_modules/typescript');
const fs = require('fs');
const path = require('path');
const configPath = ts.findConfigFile(
  '/home/nandini/Downloads/workflow-dashboard/backend/tsconfig.json',
  ts.sys.fileExists
);
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath)
);
console.log(parsedConfig.fileNames.join('\n'));
