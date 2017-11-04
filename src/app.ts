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
const mixed: string = `
#### GFM task list
- [x] GFM task list 1
- [x] GFM task list 2
- [ ] GFM task list 3
    - [ ] GFM task list 3-1
    - [ ] GFM task list 3-2
    - [ ] GFM task list 3-3
- [ ] GFM task list 4
    - [ ] GFM task list 4-1
    - [ ] GFM task list 4-2

\`\`\`mermaid
graph LR;  
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
(async (md: string) => {
  const defaultRootWebPath = path.join(__dirname, '..');
  // console.log('defaultRootWebPath= ', defaultRootWebPath);
  const options: IMermaid2htmlProOptions = {
    rootWebPath: defaultRootWebPath,
  };

  const html: string = await mermaid2html(md, options);
  console.log('html = ', html);
  return;
})(mixed);
