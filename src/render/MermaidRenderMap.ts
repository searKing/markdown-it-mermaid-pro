'use strict';
import { defaults } from 'lodash';
import * as path from 'path';
import { IMermaidBaseOptions, MermaidBase } from './MermaidBase';

export interface IMermaidRender {
  getRenderHtml(mdContent: string): string;
  registerThisPlugin(): void;
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
export interface IMermaidRenderMapOptions {
  debug?: boolean;
  renderer?: any;
  rootWebPath?: string;
}
export class MermaidRenderMap extends MermaidBase {
  private promises: Array<Promise<string>>;
  private rootWebPath: string;
  public constructor(options?: IMermaidRenderMapOptions) {
    const defaultOptions: IMermaidRenderMapOptions = {
      debug: false,
      renderer: require('markdown-it')(),
      rootWebPath: path.join(__dirname, '..', '..', '..', '..'),
    };
    options = options || {};
    defaults(options, defaultOptions);

    super({
      debug: options.debug,
      renderer: options.renderer,
    });

    this.rootWebPath = options.rootWebPath || '';
    this.promises = [];
    return this;
  }
  public async getRenderMap(mdContent: string): Promise<string[]> {
    const renderer = this.getRenderer();
    this.loadModules(renderer);

    const str = renderer.render(mdContent); // refresh promises
    const renderMaps: string[] = [];
    if (!this.promises) {
      return renderMaps;
    }
    for (const key in this.promises) {
      if (this.promises.hasOwnProperty(key)) {
        //   console.log('key = ', key);
        const p = this.promises[key];
        //   console.log('p = ', p);
        const text: string = await p;
        //   console.log('text= ', text);
        if (!text) {
          continue;
        }

        renderMaps.push(text);
      }
    }
    return renderMaps;
  }
  // process every mermaid paragraph, adn store every promise
  public handleMermaid(mermaidContent: string): string {
    const mermaidHtmlPromise = this.mermaidToHtml(mermaidContent);
    this.promises.push(mermaidHtmlPromise);
    return mermaidContent;
  }

  private async mermaidToHtml(mermaidContent: string): Promise<string> {
    // console.log('mermaidContent = ' + mermaidContent);
    const svgCode: string = await this.mermaidToHtmlAPI(mermaidContent, {
      verbose: false,
    });
    // console.log('svgCode = ' + svgCode);
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

    // 运行puppeteer，他会return一个promise，使用then方法获取browser实例
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
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
    // console.log('rootWebPath= ', this.rootWebPath);

    const sourcePath = path.join(
      this.rootWebPath,
      'node_modules/mermaid/dist/mermaid.js'
    );

    // console.log('sourcePath = ', sourcePath);
    // // 加载Mermaid脚本
    await page.addScriptTag({ path: sourcePath });

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
      function generateDomToDocument(document: Document, rawContent: string) {
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
      function mermaidSetup(document: Document, cfg: any, ganttCfg: string) {
        // const mermaidAPI = require('mermaid').mermaidAPI;
        /* tslint:disable */
        eval('window.mermaid.initialize(cfg);');

        if (!ganttCfg) {
          const sc = document.createElement('script');
          sc.appendChild(
            document.createTextNode('mermaid.ganttConfig = ' + ganttCfg + ';')
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
    await browser.close();
    // console.log('svgContent = ' + svgContent);
    return svgContent;
  }
}
