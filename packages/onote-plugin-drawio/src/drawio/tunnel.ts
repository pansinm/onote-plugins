import { TunnelFactory } from "@sinm/onote-plugin/previewer";

const tunnel = TunnelFactory.createTunnelToMainFrame("drawio");

window.onunload = () => {
  tunnel.dispose();
};

export default tunnel;
