'use strict';
import { defaults } from 'lodash';
import { IMermaidBaseOptions, MermaidBase } from './MermaidBase';
export interface IMermaidRenderHTMLOptions {
  debug?: boolean;
  renderer?: any;
  contentMaps?: string[];
}
export class MermaidRenderHTML extends MermaidBase {
  private contentMaps: string[];
  public constructor(options?: IMermaidRenderHTMLOptions) {
    const defaultOptions: IMermaidRenderHTMLOptions = {
      contentMaps: [],
      debug: false,
      renderer: require('markdown-it')(),
    };
    options = options || {};
    defaults(options, defaultOptions);

    super({
      debug: options.debug,
      renderer: options.renderer,
    });
    this.contentMaps = options.contentMaps || [];
    return this;
  }
  public getRenderHTML(mdContent: string): string {
    this.registerThisPlugin();
    return this.getRenderer().render(mdContent);
  }
  // process every mermaid paragraph, adn store every promise
  public handleMermaid(mermaidContent: string): string {
    return this.contentMaps.shift() || '';
  }

  public registerThisPlugin() {
    const renderer = this.getRenderer();
    this.loadModules(renderer);
  }
}
