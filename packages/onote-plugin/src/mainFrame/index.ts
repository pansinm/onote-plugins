export interface IEditorExtension {
  /**
   * 编辑器加载时
   * @param editor
   * @param monaco
   */
  active(editor: any, monaco: any): void;
  /**
   * 编辑器卸载时
   */
  dispose(): void;
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

export type Dispose = () => void;

export interface MainFrame {
  // 编辑器扩展
  registerEditorExtension(extension: IEditorExtension): void;

  // 文件面板
  registerFilePanel(panel: IFilePanel): void;

  readFile(uri: string): Promise<Uint8Array>;
  readText(uri: string): Promise<string>;

  writeFile(uri: string, content: Uint8Array): Promise<void>;
  writeText(uri: string, content: string): Promise<void>;

  /**
   * 监听页面发过来的事件
   */
  listenPortEvent(
    eventName: string,
    listener: (port: MessagePort, payload: any) => void
  ): Dispose;

  /**
   * 发送事件给特定port
   */
  sendPortEvent(port: MessagePort, eventName: string, payload: any): void;

  /**
   * 处理其他页面port发送的请求，返回值作为响应
   * @param method 
   * @param handler 
   */
  handlePortRequest(method: string, handler: (payload: any) => Promise<any>): Dispose;

  /**
   * 获取当前tab的url
   */
  getCurrentTabUrl(): string | undefined;

  /**
   * 插件目录
   */
  getPluginRootUri(pluginName: string): string;
}

const mainFrame = (window as any).__frame as MainFrame;

export default mainFrame;
