const fs = require('fs');
const path = require('path');

const esbuild = require('esbuild');

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const wrapIIFEInStringPlugin = {
  name: 'wrap-iife-in-string',
  setup(build) {
    // Ensure write is set to false so our plugin will always receive outputFiles
    build.initialOptions.write = false;

    build.onEnd((result) => {
      if (result.errors.length > 0) {
        console.error('Build failed with errors:', result.errors);
        return;
      }

      result.outputFiles.forEach((outputFile) => {
        let content = outputFile.text;

        // Use JSON.stringify to safely encode the content
        const wrappedContent = `// ============== AUTOGENERATED ==============
// DO NOT EDIT THIS FILE. IT IS GENERATED ON BUILD. RUN \`yarn bundle\` IN THE ROOT DIRECTORY TO UPDATE THIS FILE.
const code = ${JSON.stringify(content)};
module.exports = {
  code,
};
`;

        // Ensure the output directory exists
        const outputPath = path.resolve(outputFile.path);
        ensureDirectoryExistence(outputPath);

        // Write the modified content back to the output file
        fs.writeFileSync(outputPath, wrappedContent);
      });
    });
  },
};

(async () => {
  await esbuild.build({
    entryPoints: [
      './src/lib/litActions/solana/src/signTransactionWithSolanaEncryptedKey.js',
      './src/lib/litActions/solana/src/signMessageWithSolanaEncryptedKey.js',
      './src/lib/litActions/solana/src/generateEncryptedSolanaPrivateKey.js',
      './src/lib/litActions/ethereum/src/signTransactionWithEthereumEncryptedKey.js',
      './src/lib/litActions/ethereum/src/signMessageWithEthereumEncryptedKey.js',
      './src/lib/litActions/ethereum/src/generateEncryptedEthereumPrivateKey.js',
      './src/lib/litActions/common/src/exportPrivateKey.js',
    ],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: './src/lib/generated/',
    inject: ['./buffer.shim.js'],
    plugins: [wrapIIFEInStringPlugin],
  });
  // await esbuild.build({
  //   entryPoints: [
  //     './src/lib/litActions/ethereum/src/signTransactionWithEthereumEncryptedKey.js',
  //     './src/lib/litActions/ethereum/src/signMessageWithEthereumEncryptedKey.js',
  //     './src/lib/litActions/ethereum/src/generateEncryptedEthereumPrivateKey.js',
  //   ],
  //   bundle: true,
  //   minify: true,
  //   sourcemap: false,
  //   outdir: './src/lib/generated/litActions/ethereum',
  //   inject: ['./buffer.shim.js'],
  //   plugins: [wrapIIFEInStringPlugin],
  // });
  // await esbuild.build({
  //   entryPoints: ['./src/lib/litActions/common/src/exportPrivateKey.js'],
  //   bundle: true,
  //   minify: true,
  //   sourcemap: false,
  //   outdir: './src/lib/generated/litActions/common',
  //   inject: ['./buffer.shim.js'],
  //   plugins: [wrapIIFEInStringPlugin],
  // });
})();
