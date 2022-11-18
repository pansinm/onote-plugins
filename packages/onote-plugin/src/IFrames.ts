interface Frame {
    url: string;
}

export default interface IFrames {
    /**
     * frame loaded callback
     * @param frame 
     */
    onLoaded(callback: (frame: Frame) => void): void;
    /**
     * inject js to frame
     * @param frame 
     * @param jsPath 
     */
    injectJs(frame: Frame, jsPath: string): void;
}