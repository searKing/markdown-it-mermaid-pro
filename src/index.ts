// export {
//   IMarkdownItMermaidPro,
//   MarkdowItMermaidPro,
// } from './markdown-it-mermaid';
// export {
//   IMermaid2htmlProOptions,
//   mermaid2html,
// } from './markdown-it-mermaid-pro';
// export {
//   mermaid_pro_plugin_init_everytime,
// } from './markdown-it-mermaid-pro';
import {
  IMermaidProPluginOptions,
  mermaid2html,
  mermaid_pro_plugin,
  mermaid_pro_plugin_init_everytime,
} from './markdown-it-mermaid-pro';
interface IStatefulFunction {
  (md: any, options: IMermaidProPluginOptions): any;
  mermaid2html: any;
  mermaid_pro_plugin_init_everytime: any;
}

const pluginFunc: IStatefulFunction = ((
  md: any,
  options: IMermaidProPluginOptions
) => {
  mermaid_pro_plugin(md, options);
}) as IStatefulFunction;

pluginFunc.mermaid2html = mermaid2html;
pluginFunc.mermaid_pro_plugin_init_everytime = mermaid_pro_plugin_init_everytime;

export = pluginFunc as any;
