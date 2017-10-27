import * as path from 'path';

import { mermaid_pro_plugin } from './markdown-it-mermaid-pro';

const taskList: string = `
\`\`\`sequence
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

  const html: string = await mermaid_pro_plugin(md, defaultRootWebPath);
  console.log('renderedhtml= ', html);

  return;
})(taskList);
