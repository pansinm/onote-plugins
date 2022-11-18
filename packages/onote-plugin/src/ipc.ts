export interface IPCMessage {
    method: string;
    payload?: any;
    error?: any;
    type: "request" | "response" | "event";
    id: string;
  }
  
  export interface IPCEvent extends IPCMessage {
    type: "event";
  }
  
  export interface IPCRequest extends IPCMessage {
    type: "request";
  }
  
  export interface IPCResponse extends IPCMessage {
    type: "response";
  }
  