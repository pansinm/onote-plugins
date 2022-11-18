import { EventEmitter } from "events";
import uniqueId from "lodash/uniqueId";
import { IPCMessage, IPCResponse } from "../ipc";
import { waitEvent } from "../util";

export class Port {
  private emitter = new EventEmitter();
  private port?: MessagePort;
  constructor() {
    window.addEventListener("message", (ev) => {
      const { type } = ev.data || {};
      if (type === "port") {
        const port = ev.ports[0];
        if (port) {
          this.initPort(port);
        }
      }
    });
    window.parent.postMessage({ type: "request-port" });
  }

  async ready() {
    if (this.port) {
      return;
    }
    await waitEvent(this.emitter, "ready");
  }

  private sendMessage(message: Omit<IPCMessage, "id">) {
    const id = uniqueId("previewer-");
    this.port?.postMessage({ ...message, id });
    return id;
  }

  async handleEvent(eventName: string, listener: (payload: any) => void) {
    const _listener = (data: any) => listener(data.payload);
    this.emitter.on(eventName, _listener);
    return () => {
      this.emitter.off(eventName, _listener);
    };
  }

  async sendRequestAndWait(method: string, payload?: any) {
    await this.ready();
    const id = this.sendMessage({
      method,
      payload,
      type: "request",
    });
    const res: IPCResponse = await waitEvent(
      this.emitter,
      method,
      (res) => res.id === id
    );
    if (res.error) {
      throw new Error(res.error.message);
    }
    return res.payload;
  }

  async sendEvent(eventName: string, payload?: any) {
    this.sendMessage({
      method: eventName,
      payload,
      type: "event",
    });
  }

  private initPort(port: MessagePort) {
    port.addEventListener("message", (event) => {
      const { method } = event.data;
      this.emitter.emit(method, event.data);
    });

    // 刷新主窗口时
    port.addEventListener("close", (e) => {
      port?.close();
      this.port = undefined;
      console.log("previewer port closed", e);
      setTimeout(
        () => window.parent.postMessage({ type: "request-port" }),
        2000
      );
    });
    port.start();
    this.port = port;
    this.emitter.emit("ready");
  }
}

export const port = ((window as any).__port as Port) ?? new Port();

(window as any).__port = port;
