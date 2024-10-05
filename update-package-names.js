const fs = require('fs');
const path = require('path');
const glob = require('glob');

const oldScope = '@overdive';
const newScope = '@overdive';
const projectRoot = path.resolve(__dirname);

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = content.replace(new RegExp(oldScope, 'g'), newScope);

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${filePath}`);
  }
}

// 처리할 파일 확장자 목록
const extensions = '{js,jsx,ts,tsx,json,md,yml,yaml,mjs}';

// 모든 관련 파일을 찾아 업데이트
glob.sync(`**/*.${extensions}`, { 
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  nodir: true
}).forEach(file => {
  const filePath = path.join(projectRoot, file);
  updateFile(filePath);
});

console.log('Update complete.');