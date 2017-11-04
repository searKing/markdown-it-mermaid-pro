'use strict';
import { MermaidRenderHTML } from './render/MermaidRenderHTML';
import { MermaidRenderMap } from './render/MermaidRenderMap';
import { Log } from './utils/log';
export interface IMermaid2htmlProOptions {
  debug?: boolean;
  renderer?: any;
  rootWebPath?: string;
}
export interface IMermaidProPluginOptions {
  debug?: boolean;
  contentMaps?: string[];
}

export function mermaid_pro_plugin(
  md: any,
  options: IMermaidProPluginOptions
): void {
  const ro = {
    contentMaps: options.contentMaps,
    debug: options.debug,
    renderer: md,
  };
  const mr = new MermaidRenderHTML(ro);
  mr.registerThisPlugin();
  return;
}
export function mermaid_pro_plugin_init_everytime(
  markdownContent: string,
  rootWebPathInput: string | undefined
): Promise<string[]> {
  return (async () => {
    const ro = {
      rootWebPath: rootWebPathInput,
    };
    const mr = new MermaidRenderMap(ro);
    return mr.getRenderMap(markdownContent);
  })();
}
export function mermaid2html(
  markdownContent: string,
  options: IMermaid2htmlProOptions
): Promise<string> {
  return mermaid2html_async(markdownContent, options);
}

function mermaid2html_async(
  markdownContent: string,
  options: IMermaid2htmlProOptions
) {
  return (async () => {
    let html = '';
    if (typeof markdownContent !== 'string') {
      throw Error('first argument must be a string');
    }
    const cms = await mermaid_pro_plugin_init_everytime(
      markdownContent,
      options.rootWebPath
    );
    const md = options.renderer || require('markdown-it')();
    const ro = {
      contentMaps: cms,
      debug: options.debug,
    };
    mermaid_pro_plugin(md, ro);
    html = md.render(markdownContent);
    if (!!options && options.debug) {
      html = debugHeader() + '\n' + html;
    }
    return html;
  })();
}
function log(msg: string, debug: boolean) {
  if (debug) {
    Log.print(msg);
  }
}
function debugHeader() {
  const info = require('../package.json') || {};
  const debugHeaderStr =
    '<!--' +
    ' this HTML was generated using markdown-it-mermaid-pro version ' +
    info.version +
    '.' +
    ' see an issue? file at ' +
    info.issuesUrl +
    '.' +
    ' please include the version in your issue. thanks for using markdown2html-pro!' +
    ' to learn more, visit ' +
    info.repositoryUrl +
    '.' +
    '  -->';
  return debugHeaderStr;
}
