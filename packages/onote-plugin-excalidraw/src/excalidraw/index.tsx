import React from 'react';
import ReactDOM from 'react-dom';
import { port } from "@sinm/onote-plugin/previewer";
import App from './App';

port.ready().then(() => {
  port.sendEvent('excalidraw.ready');
});


ReactDOM.render(<App />, document.getElementById('app'));