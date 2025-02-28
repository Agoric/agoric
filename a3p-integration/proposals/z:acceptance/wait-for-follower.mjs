/* eslint-env node */

import { readFile, watch } from 'fs/promises';

const FILE_ENCODING = 'utf-8';
const FILE_PATH = process.env.MESSAGE_FILE_PATH;

/**
 * @param {string} filePath
 * @param {string} message
 */
const checkFileContent = async (filePath, message) => {
  const fileContent = (await readFile(filePath, FILE_ENCODING)).trim();
  if (!new RegExp(message).test(fileContent)) return '';
  return fileContent;
};

/**
 * @param {string} filePath
 */
const watchSharedFile = async filePath => {
  const [, , message] = process.argv;

  let possibleContent = await checkFileContent(filePath, message);
  if (possibleContent) return possibleContent;

  for await (const { eventType } of watch(filePath)) {
    if (eventType === 'change') {
      possibleContent = await checkFileContent(filePath, message);
      if (possibleContent) return possibleContent;
    }
  }

  return undefined;
};

FILE_PATH &&
  watchSharedFile(FILE_PATH).then(
    fileContent => fileContent && console.log(fileContent),
  );
