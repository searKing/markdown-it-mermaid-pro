'use strict';
export interface IMermaidRender {
  renderToHtml(mdContent: string): string;
}

export interface IMermaidRenderOptions {
  cb?: any;
  contentMaps?: string[];
  debug?: boolean;
  renderer?: any;
}
interface IPuppeteerOptions {
  cb?: any;
  contents?: string;
  contentMaps?: string[];
  debug?: boolean;
  renderer?: any;
  ganttConfig?: any;
  sequenceConfig?: any;
  confWidth?: number;
}
// import {MarkdownIt } from "markdown-it";
// let taskLists = require('markdown-it-task-lists');
export class MermaidRender implements IMermaidRender {
  private cb: any;
  private contentMaps: string[];
  private promises: Array<Promise<string>>;
  private renderer: any;
  private options: IMermaidRenderOptions;
  public constructor(options?: IMermaidRenderOptions) {
    this.options = options || {};
    this.renderer = this.options.renderer;
    this.cb = this.options.cb;
    this.contentMaps = this.options.contentMaps || [];
    this.promises = [];
    return this;
  }
  public renderToHtml(mdContent: string): string {
    this.loadModules();
    const renderer = this.getRenderer();

    const str = renderer.render(mdContent);
    if (!!this.cb) {
      this.cb(this.promises);
    }
    return str;
  }
  private loadModules() {
    this.container_what(this.getRenderer(), 'sequence');
    this.container_what(this.getRenderer(), 'Mermaid');
  }
  private getRenderer(): any {
    return this.renderer;
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
          let mermaidHtml = mermaidContent;
          console.log('mermaidContent', mermaidContent);
          console.log('this.contentMaps', this.contentMaps);
          if (!!this.contentMaps && this.contentMaps.length > 0) {
            mermaidHtml = this.contentMaps.shift() || '';
          } else {
            const mermaidHtmlPromise = this.mermaidToHtml(mermaidContent);
            this.promises.push(mermaidHtmlPromise);
          }
          // opening tag
          return `${mermaidHtml}`;
        } else {
          // closing tag
          return '\n';
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
  private async mermaidToHtml(mermaidContent: string): Promise<string> {
    console.log('mermaidContent = ' + mermaidContent);
    const svgCode: string = await this.mermaidToHtmlAPI(mermaidContent, {
      verbose: true,
    });
    console.log('svgCode = ' + svgCode);
    return Promise.resolve(svgCode);
  }
  private async mermaidToHtmlAPI(
    mermaidContent: string,
    options: any
  ): Promise<string> {
    // Puppeteer是一个node库，他提供了一组用来操纵Chrome的API（默认headless也就是无UI的chrome，也可以配置为有UI）
    // 有点类似于PhantomJS，但Puppeteer是Chrome官方团队进行维护的，前景更好。
    // 使用Puppeteer，相当于同时具有Linux和Chrome的能力，应用场景会非常多。就爬虫领域来说，远比一般的爬虫工具功能更丰富，性能分析、自动化测试也不在话下，今天先探讨爬虫相关
    const puppeteer = require('puppeteer');

    const svg: string = 'HTHT';

    // 运行puppeteer，他会return一个promise，使用then方法获取browser实例
    const browser = await puppeteer.launch({ headless: true });
    await puppeteer
      .launch({ headless: true })
      .then(async (browserInstance: any) => {
        console.log('puppeteer launched ');
        const page = await browserInstance.newPage();

        // await page.goto("http://jackhiston.com/");
        // await page.screenshot({ path: "jackhiston-blog.png" });

        // browser.close();
        // 得到一个page实例
        // const page = await browser.newPage();
        // // 设置页面内容
        await page.setContent(
          [
            '<html>',
            '<head>',
            '<style type="text/css">body {background:white;font-family: Arial;}',
            options.css,
            '</style>',
            '</head>',
            '<body>',
            '</body>',
            '</html>',
          ].join('\n')
        );
        // // 加载Mermaid脚本
        await page.injectFile('node_modules/mermaid/dist/mermaid.js');
        // //  注册日志打印函数
        page.on('console', (...args: any[]) => {
          if (options.verbose) {
            console.log(...args);
          }
        });
        // sequenceConfig.useMaxWidth = false
        const width = options.width;
        // this JS is executed in this statement is sandboxed, even though it doesn't
        // look like it.we need to serialize then unserialize the svgContent that's
        // taken from the DOM
        // 执行函数，进行Mermaid2html转换
        // await page.evaluate(() => {alert('1')});
        // await page.evaluate(this.hehe);
        // function hehe(){
        //   alert('1')
        // }

        function executeInPage(data: IPuppeteerOptions): Promise<string> {
          const xmlSerializer = new XMLSerializer();
          const contents: string = data.contents || '';
          let sequenceConfig;
          if (!data.sequenceConfig) {
            sequenceConfig = JSON.stringify(data.sequenceConfig).replace(
              /"(function.*})"/,
              '$1'
            );
          }
          let ganttConfig: string = '';
          if (!data.ganttConfig) {
            ganttConfig = JSON.stringify(data.ganttConfig).replace(
              /"(function.*})"/,
              '$1'
            );
          }
          let boundingBox;
          let w;
          let h;
          let confWidth = data.confWidth;
          function clearPage(document: Document) {
            // 移除当前浏览器页面中所有的 .mermaid
            const toRemove = document.getElementsByClassName('mermaid');
            if (toRemove && toRemove.length) {
              for (let i = 0, len = toRemove.length; i < len; i++) {
                const ele: any = toRemove[i];
                if (!ele) {
                  continue;
                }
                ele.parentNode.removeChild(ele);
              }
            }
          }
          clearPage(document);

          // 生成MermaidDom
          function generateDomToDocument(
            document: Document,
            rawContent: string
          ) {
            // 清除当前页面的mermaidDOM，清除历史
            clearPage(document);
            // 创建一个空DOM，class=mermaid,从而符合Mermaid要求
            const el = document.createElement('div');
            el.className = 'mermaid';
            // 将待渲染的mermaid文本添加到mermaid节点中
            el.appendChild(document.createTextNode(rawContent));
            document.body.appendChild(el);
          }
          generateDomToDocument(document, contents);

          const config = {
            flowchart: { useMaxWidth: false },
            logLevel: 1,
            // sequenceDiagram: JSON.parse(sequenceConfig),
          };

          // 生成mermaid脚本，并加载到document中
          function mermaidSetup(
            document: Document,
            cfg: any,
            ganttCfg: string
          ) {
            // const mermaidAPI = require('mermaid').mermaidAPI;
            /* tslint:disable */
            eval('window.mermaid.initialize(cfg);');

            if (!ganttCfg) {
              const sc = document.createElement('script');
              sc.appendChild(
                document.createTextNode(
                  'mermaid.ganttConfig = ' + ganttCfg + ';'
                )
              );
              document.body.appendChild(sc);
            }

            eval('window.mermaid.init();');
          }
          mermaidSetup(document, config, ganttConfig);
          const svgDom = document.querySelector('svg');
          if (!svgDom) {
            console.log('svgfailed');
            return Promise.resolve('');
          }

          boundingBox = svgDom.getBoundingClientRect(); // the initial bonding box of the svg
          w = boundingBox.width * 1.5; // adding the scale factor for consistency with output in chrome browser
          h = boundingBox.height * 1.5; // adding the scale factor for consistency with output in chrome browser
          if (!confWidth) {
            confWidth = w;
          }
          const scalefactor = confWidth / (w - 8);

          // resizing the body to fit the svg
          document.body.setAttribute(
            'style',
            'width: ' + (confWidth - 8) + '; height: ' + h * scalefactor + ';'
          );
          // resizing the svg via css for consistent display
          svgDom.setAttribute(
            'style',
            'width: ' + (confWidth - 8) + '; height: ' + h * scalefactor + ';'
          );

          // set witdth and height attributes used to set the viewport when rending png image
          svgDom.setAttribute('width', confWidth + '');
          svgDom.setAttribute('height', h * scalefactor + '');

          const svgValue = xmlSerializer.serializeToString(svgDom) + '\n';
          // console.log('svgValue = ', svgValue);
          return Promise.resolve(svgValue);
        }
        const svgContent: string = await page.evaluate(executeInPage, {
          confWidth: width,
          contents: mermaidContent,
          ganttConfig: null,
          sequenceConfig: null,
        });
        // console.log('svgContent = ' + svgContent);
        browserInstance.close();
        return svgContent;
      });
    console.log('svg = ' + svg);
    return svg;
  }
}
