#!/usr/bin/env node
/* eslint-env node */

/**
 * Help us workaround a limitation in Cloudflare Pages that prevents us from
 * publishing static files to a top-level `/functions` directory. (Cloudflare
 * reserves this namespace for Worker Functions as of
 * https://github.com/cloudflare/workers-sdk/pull/2103).
 *
 * This script -
 * 1. renames `/functions` directory to `/funcs`
 * 2. updates generated urls in html files to reference new url path
 * 3. updates base64 encoded navigation and search data to reference new url path
 *
 * If an `md` argument is supplied - versus the optional default `html` document -
 * a different set of logic will run to update paths are links for markdown files.
 *
 * See https://github.com/TypeStrong/typedoc/issues/2111 for more solutions
 * on how to workaround this.
 *
 * See https://github.com/Agoric/agoric-sdk/issues/9729 for tracking of the
 * issue in this project. If a different solution is arrived at, we can remove
 * this file and the accompanying `yarn docs:update-functions-path`.
 */

const fsp = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const process = require('process');

const config = {
  oldDirName: 'functions',
  newDirName: 'funcs',
  apiDocsDir: path.join(__dirname, '..', 'api-docs'),
  dataFiles: [
    {
      path: path.join(__dirname, '..', 'api-docs', 'assets', 'navigation.js'),
      windowKey: 'navigationData',
    },
    {
      path: path.join(__dirname, '..', 'api-docs', 'assets', 'search.js'),
      windowKey: 'searchData',
    },
  ],
};

// Decodes and decompresses the TypeDoc data
function decodeTypeDocData(encodedData) {
  return new Promise((resolve, reject) => {
    const base64Data = encodedData.replace(
      /^data:application\/octet-stream;base64,/,
      '',
    );
    const buffer = Buffer.from(base64Data, 'base64');

    zlib.gunzip(buffer, (err, decompressed) => {
      if (err) {
        reject(new Error(`Failed to decompress data: ${err.message}`));
        return;
      }

      try {
        const jsonData = JSON.parse(decompressed.toString('utf-8'));
        resolve(jsonData);
      } catch (parseError) {
        reject(new Error(`Failed to parse JSON: ${parseError.message}`));
      }
    });
  });
}

// Compresses and encodes the TypeDoc data
function encodeTypeDocData(jsonData) {
  return new Promise((resolve, reject) => {
    const jsonString = JSON.stringify(jsonData);

    zlib.gzip(jsonString, (err, compressed) => {
      if (err) {
        reject(new Error(`Failed to compress data: ${err.message}`));
        return;
      }

      const base64Data = compressed.toString('base64');
      resolve(`data:application/octet-stream;base64,${base64Data}`);
    });
  });
}

// Recursively updates URLs in the data
function updateUrls(data, searchString, replaceString) {
  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      if (
        typeof data[key] === 'string' &&
        data[key].includes(`${searchString}/`)
      ) {
        data[key] = data[key].replace(
          new RegExp(`${searchString}/`, 'g'),
          `${replaceString}/`,
        );
      } else if (typeof data[key] === 'object') {
        updateUrls(data[key], searchString, replaceString);
      }
    }
  }
  return data;
}

// Updates js-based data file (navigation or search)
async function updateDataFile(filePath, windowKey) {
  const fileContent = await fsp.readFile(filePath, 'utf8');
  const match = fileContent.match(
    new RegExp(`window\\.${windowKey} = "(.*?)"`),
  );
  if (!match) {
    throw new Error(`${windowKey} data not found in file`);
  }
  const encodedData = match[1];

  const decodedData = await decodeTypeDocData(encodedData);
  const updatedData = updateUrls(
    decodedData,
    config.oldDirName,
    config.newDirName,
  );
  const newEncodedData = await encodeTypeDocData(updatedData);
  const newFileContent = `window.${windowKey} = "${newEncodedData}"`;
  await fsp.writeFile(filePath, newFileContent);
  console.log(`${windowKey} updated successfully`);
}

/**
 * Updates files in a directory
 * @param {string} dir - Directory to update
 * @param {string} fileExtension - File extension to process
 * @param {Function} updateFunction - Function to update file content
 */
async function updateFiles(dir, fileExtension, updateFunction) {
  const files = await fsp.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      if (file === config.oldDirName) {
        const newPath = path.join(dir, config.newDirName);
        await fsp.rename(filePath, newPath);
        console.log(`Renamed directory: ${filePath} to ${newPath}`);
        await updateFiles(newPath, fileExtension, updateFunction);
      } else {
        await updateFiles(filePath, fileExtension, updateFunction);
      }
    } else if (path.extname(file) === fileExtension) {
      const content = await fsp.readFile(filePath, 'utf8');
      const updatedContent = updateFunction(content);
      if (content !== updatedContent) {
        await fsp.writeFile(filePath, updatedContent);
        console.log(`Updated: ${filePath}`);
      }
    }
  }
}

/**
 * Updates content in Markdown files
 * @param {string} content - The Markdown content to update
 * @returns {string} - The updated Markdown content
 */
function updateMarkdownContentLinks(content) {
  return (
    content
      // Update links like [text](functions/file.md)
      .replace(
        new RegExp(`\\[(.*?)\\]\\(${config.oldDirName}/`, 'g'),
        `[$1](${config.newDirName}/`,
      )
      // Update links like [text](../functions/file.md)
      .replace(
        new RegExp(`\\[(.*?)\\]\\(\\.\\./${config.oldDirName}/`, 'g'),
        `[$1](../${config.newDirName}/`,
      )
  );
}

/**
 * Updates content in HTML files
 * @param {string} content - The HTML content to update
 * @returns {string} - The updated HTML content
 */
function updateHtmlContentLinks(content) {
  return content.replace(
    new RegExp(`/${config.oldDirName}/`, 'g'),
    `/${config.newDirName}/`,
  );
}

/**
 * Main function to run the script
 */
async function main() {
  const fileType = process.argv[2] || 'html';
  await null;
  switch (fileType) {
    case 'html':
      await updateFiles(config.apiDocsDir, '.html', updateHtmlContentLinks);
      for (const dataFile of config.dataFiles) {
        await updateDataFile(dataFile.path, dataFile.windowKey);
      }
      return;
    case 'md':
      return updateFiles(config.apiDocsDir, '.md', updateMarkdownContentLinks);
    default:
      throw new Error('Invalid file type. Use "html" or "md".');
  }
}

main().catch(e => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
