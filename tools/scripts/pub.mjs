// # Usage: node tools/scripts/pub.mjs
// import { exec } from 'child_process';

import { exit } from 'process';
import {
  asyncForEach,
  greenLog,
  listDirsRecursive,
  runCommand,
  getArgs,
  childRunCommand,
  spawnCommand,
  readJsonFile,
  versionChecker,
  redLog,
  question,
  writeJsonFile,
} from './utils.mjs';

const args = getArgs();
const OPTION = args[0];
const VALUE = args[1];

if (!OPTION || OPTION === '' || OPTION === '--help') {
  greenLog(
    `
  Usage: node tools/scripts/pub.mjs [option] [value]
  option:
    --tag: publish with a tag
    --prod: publish to production
  `,
    true
  );
  exit();
}

if (OPTION) {
  if (OPTION === '--tag') {
    if (!VALUE) {
      redLog('Please provide a tag value', true);
      exit();
    }
  }

  if (OPTION === '--prod') {
    console.log('Publishing to production');
  }
}

// read lerna.json version
const lerna = await readJsonFile('lerna.json');
const lernaVersion = lerna.version;

let dirs = await listDirsRecursive('dist/packages', false);

console.log('Ready to publish the following packages:');

await asyncForEach(dirs, async (dir) => {
  // read the package.json file
  const pkg = await readJsonFile(`${dir}/package.json`);

  // check version
  const res = versionChecker(pkg, lernaVersion);

  if (res.status === 500) {
    redLog(res.message);
  }

  if (res.status === 200) {
    greenLog(res.message);
  }
});

// prompt user to confirm publish
const type =
  OPTION === '--tag'
    ? `TAG => ${VALUE}

  You will need to install like this: yarn add @lit-protocol/lit-node-client@${VALUE}`
    : 'PRODUCTION';

greenLog(
  `
  Publishing: ${type}
`,
  true
);

await question('Are you sure you want to publish to? (y/n)', {
  yes: async () => {
    greenLog('Publishing...');
    // await 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await asyncForEach(dirs, async (dir) => {
      // read the package.json file
      const pkg = await readJsonFile(`${dir}/package.json`);

      // also read the individual package.json and update the version
      try{
        const pkg2 = await readJsonFile(
          `${dir.replace('dist/', '')}/package.json`
        );
        pkg2.version = lernaVersion;

        // write the package.json file
        await writeJsonFile(`${dir.replace('dist/', '')}/package.json`, pkg2);
      }catch(e){
        // swallow
      }

      // update version
      pkg.version = lernaVersion;

      // write the package.json file
      await writeJsonFile(`${dir}/package.json`, pkg);

      if (OPTION === '--tag') {
        greenLog(`Publishing ${dir} with tag ${VALUE}`);

        spawnCommand('npm', ['publish', '--access', 'public', '--tag', VALUE], {
          cwd: dir,
        }, {logExit: false});
      }

      if (OPTION === '--prod') {
        spawnCommand('npm', ['publish', '--access', 'public'], {
          cwd: dir,
        }, {logExit: false});
      }
    });
  },
  no: () => {
    redLog('Publish cancelled', true);
    exit(0);
  },
});

// exit();

// if (FLAG === '--filter') {
//   dirs = dirs.filter((dir) => dir.includes(VALUE));
// }

// dirs.forEach((dir) => {
//   greenLog(`Publishing ${dir}`);

//   if (FLAG2 !== '--dry-run') {
//     spawnCommand('npm', ['publish', '--access', 'public'], {
//       cwd: dir,
//     });
//     // exec(`cd ${dir} && npm publish --access public`);
//   } else {
//     greenLog(`Dry run, skipping publish`);
//   }
// });

// // exit(0);
