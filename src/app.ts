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
  const html: string = await mermaid_pro_plugin(md);
  console.log('renderedhtml= ', html);

  return;
})(taskList);
