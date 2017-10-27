import { defaults } from 'lodash';
import {
  IMermaidRender,
  IMermaidRenderOptions,
  MermaidRender,
} from './render/render';
import { IDefaultOptions } from './utils/configuration';
import './utils/json';
import { Log } from './utils/log';
export function mermaid_plugin(md: any, rootWebDir: string | undefined) {
  const options: IDefaultOptions = {
    cb: undefined,
    contentMaps: undefined,
    debug: false,
    renderer: md,
    rootWebPath: rootWebDir,
  };
  const markdowItMermaidPro = new MarkdowItMermaidPro(options);
}

export interface IMarkdownItMermaidPro {
  mermaid2html(markdown: string): string;
}
export class MarkdowItMermaidPro implements IMarkdownItMermaidPro {
  private options: IDefaultOptions;
  // tslint:disable-next-line:member-ordering
  private defaultOptions: IDefaultOptions = {
    cb: undefined,
    contentMaps: undefined,
    debug: false,
    renderer: require('markdown-it')(),
    rootWebPath: undefined,
  };

  constructor(options?: IDefaultOptions) {
    if (!!options && typeof options !== 'object') {
      throw Error('argument must be an object,now options is ' + options);
    }
    options = options || this.defaultOptions;
    defaults(options, this.defaultOptions);
    this.options = options;
    return this;
  }

  public mermaid2html(markdown: string): string {
    let html: string = '';

    if (typeof markdown !== 'string') {
      throw Error('first argument must be a string');
    }

    this.log(this.banner());
    const markdownRenderOptions: IMermaidRenderOptions = {
      cb: this.options.cb,
      contentMaps: this.options.contentMaps,
      debug: this.options.debug,
      renderer: this.options.renderer,
      rootWebPath: this.options.rootWebPath,
    };
    // console.log('rootWebPath= ', markdownRenderOptions.rootWebPath);

    const render: IMermaidRender = new MermaidRender(markdownRenderOptions);
    html = render.renderToHtml(markdown);

    if (this.options.debug) {
      html = this.debugHeader() + '\n' + html;
    }

    return html;
  }
  private log(msg: string): void {
    if (this.options.debug) {
      Log.print(msg);
    }
  }
  private banner(): string {
    let banner: string = '\n\n' + 'markdown2html-pro';
    banner += 'Parse markdown into HTML and add syntax highlighting';
    return banner;
  }
  private debugHeader(): string {
    const info = require('../package.json') || {};
    const debugHeader: string =
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

    return debugHeader;
  }
}
