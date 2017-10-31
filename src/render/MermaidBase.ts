'use strict';
import { defaults } from 'lodash';

import * as path from 'path';

export interface IMermaidBaseOptions {
    debug?: boolean;
    renderer?: any;
}
export class MermaidBase {
    private renderer: any;

    public constructor(options?: IMermaidBaseOptions) {
        const defaultOptions: IMermaidBaseOptions = {
            debug: false,
            renderer: require('markdown-it'),
        }
        options = options || {}
        defaults(options, defaultOptions);

        this.renderer = options.renderer;
        return this;
    }

    public getRenderer(): any {
        return this.renderer;
    }
    public loadModules(render: any) {
        this.container_what(render, 'mermaid');
    }
    public handleMermaid(mermaidContent: string): string {
        return mermaidContent;
    }
    // ```tag
    // ```
    private container_what(md: any, tag: string): any {
        // ^${tag}\s+(.*)$
        const re = new RegExp('^' + tag + '\\s*$');

        // const re = new RegExp("^" + tag + "\\s+(.*)$");
        return md.use(require('markdown-it-container'), tag, {
            marker: '`',
            render: (tokens: any, idx: number, options: any, env: any, self: any) => {
                // console.log('tokens[' + idx + '] = ' + tokens[idx].info);
                // console.log('tokens = ' + JSON.stringify(tokens) );
                // const m = tokens[idx].info.trim().match(re);

                if (tokens[idx].nesting === 1) {
                    const mermaidContent = this.getContentFromTokens(tokens);
                    const mermaidHtml = this.handleMermaid(mermaidContent);
                    // opening tag
                    return `${mermaidHtml}` + '<!--';
                } else {
                    // closing tag
                    return '-->';
                }
            },
            validate: (params: any) => {
                return params.trim().match(re);
            },
        });
    }

    private getContentFromTokens(tokens: any) {
        let mermaidContent = '';
        for (const token of tokens) {
            if (token.type === 'inline') {
                mermaidContent = token.content;
                break;
            }
        }

        return mermaidContent;
    }
}