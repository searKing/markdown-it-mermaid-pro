import * as path from 'path';

import {
  IMermaid2htmlProOptions,
  mermaid2html,
} from './markdown-it-mermaid-pro';

const taskList: string = `
\`\`\`mermaid
graph TD;
A-->B;
A-->C;
B-->D;
C-->D;
\`\`\`
`;

(async (md: string) => {
  const defaultRootWebPath = path.join(__dirname, '..');
  // console.log('defaultRootWebPath= ', defaultRootWebPath);
  const options: IMermaid2htmlProOptions = {
    rootWebPath: defaultRootWebPath,
  };

  const html: string = await mermaid2html(md, options);
  console.log('html = ', html);
  return;
})(taskList);
