import { MarkdowItMermaidPro } from './markdown-it-mermaid';
const taskList: string = `
\`\`\`sequence
graph TD;
A-->B;
A-->C;
B-->D;
C-->D;
\`\`\`
`;
const taskListExpect: string = `<pre><code class=\"language-sequence\">graph TD;
A--&gt;B;
A--&gt;C;
B--&gt;D;
C--&gt;D;
</code></pre>
`;

let renderPromises: Array<Promise<string>> = [];
const renderBeginoptions = {
  cb: (promises: Array<Promise<string>>) => {
    renderPromises = promises;
  },
  contentMaps: [],
};
const markdowItMermaidBeginPro = new MarkdowItMermaidPro(renderBeginoptions);
markdowItMermaidBeginPro.mermaid2html(taskList);
(async function handle() {
  const renderMaps: string[] = [];
  console.log('renderPromises= ', renderPromises);
  if (!renderPromises) {
    return;
  }
  for (const key in renderPromises) {
    if (renderPromises.hasOwnProperty(key)) {
      console.log('key = ', key);
      const p = renderPromises[key];
      console.log('p = ', p);
      const text: string = await p;
      console.log('text= ', text);
      if (!text) {
        continue;
      }

      renderMaps.push(text);
    }
  }
  const renderEndoptions = {
    cb: undefined,
    contentMaps: renderMaps,
  };
  const markdowItMermaidEndPro = new MarkdowItMermaidPro(renderEndoptions);
  console.log('rendered= ', markdowItMermaidEndPro.mermaid2html(taskList));
  markdowItMermaidEndPro.mermaid2html(taskList);
  // expect(markdowItMermaidEndPro.mermaid2html(taskList)).toBe(taskListExpect);
})();
