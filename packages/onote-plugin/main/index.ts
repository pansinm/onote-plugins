import { Dispose, IDisposable } from "../common/util";
import type Tunnel from "../previewer/tunnel/Tunnel";

export interface IEditorExtension {
  /**
   * 编辑器加载时
   * @param editor
   * @param monaco
   */
  active(editor: any, monaco: any): IDisposable;
}

export interface ITab {
  uri: string;
}

export interface IFilePanel {
  /**
   * 支持的文件后缀
   */
  extensions: string[];
  /**
   * 取文件内容的方法
   * @param uri
   */
  doGetContent?(uri: string): Promise<string>;
  /**
   * 保存文件的方法
   * @param uri
   * @param content
   */
  doSaveContent?(uri: string, content: string): Promise<void>;
  /**
   * 是否显示文本编辑器
   */
  editable: boolean;
  /**
   * 语言id
   */
  languageId?: string;
  /**
   * 文件预览的 iframe url
   */
  previewer?: string;
}

export interface MainFrame {
  /**
   * 获取当前tab
   */
  getActiveTab(): ITab | undefined;

  /**
   * 打开tab
   * @param uri
   */
  openTab(uri: string): void;

  /**
   * Tab激活
   * @param callback
   */
  onTabActivated(callback: (tab: ITab) => void): Dispose;

  // 编辑器扩展
  registerEditorExtension(extension: IEditorExtension): void;

  // 注册文件面板
  registerFilePanel(panel: IFilePanel): void;

  readFile(uri: string): Promise<Uint8Array>;
  readText(uri: string): Promise<string>;

  writeFile(uri: string, content: Uint8Array): Promise<void>;
  writeText(uri: string, content: string): Promise<void>;

  onNewTunnel(callback: (tunnel: Tunnel) => void): IDisposable;

  findTunnels(indicate: (tunnel: Tunnel) => boolean): Tunnel[];

  /**
   * 插件目录
   */
  getPluginRootUri(pluginName: string): string;
}

const mainFrame = (window as any).__frame as MainFrame;

export default mainFrame;
