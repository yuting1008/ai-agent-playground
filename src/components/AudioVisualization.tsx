import React, { useEffect, useRef } from 'react';
import { WavRenderer } from '../lib/wav_renderer';
import { useContexts } from '../providers/AppProvider';
import { CONNECT_CONNECTED } from '../lib/const';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';

const AudioVisualization: React.FC<{
  wavRecorder: WavRecorder;
  wavStreamPlayer: WavStreamPlayer;
}> = ({ wavRecorder, wavStreamPlayer }) => {
  const { connectStatus } = useContexts();

  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const serverCanvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const clientCanvas = clientCanvasRef.current;
    let clientCtx: CanvasRenderingContext2D | null = null;

    const serverCanvas = serverCanvasRef.current;
    let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        if (clientCanvas) {
          if (!clientCanvas.width || !clientCanvas.height) {
            clientCanvas.width = clientCanvas.offsetWidth;
            clientCanvas.height = clientCanvas.offsetHeight;
          }
          clientCtx = clientCtx || clientCanvas.getContext('2d');
          if (clientCtx) {
            clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
            const result = wavRecorder.recording
              ? wavRecorder.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              clientCanvas,
              clientCtx,
              result.values,
              '#80cc29',
              20,
              0,
              8,
            );
          }
        }
        if (serverCanvas) {
          if (!serverCanvas.width || !serverCanvas.height) {
            serverCanvas.width = serverCanvas.offsetWidth;
            serverCanvas.height = serverCanvas.offsetHeight;
          }
          serverCtx = serverCtx || serverCanvas.getContext('2d');
          if (serverCtx) {
            serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
            const result = wavStreamPlayer.analyser
              ? wavStreamPlayer.getFrequencies('voice')
              : { values: new Float32Array([0]) };
            WavRenderer.drawBars(
              serverCanvas,
              serverCtx,
              result.values,
              '#ffffff',
              20,
              0,
              8,
            );
          }
        }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className="visualization"
        style={{
          display: connectStatus === CONNECT_CONNECTED ? '' : 'none',
        }}
      >
        <div className="visualization-entry server">
          <canvas ref={serverCanvasRef} />
        </div>
        <div className="visualization-entry client">
          <canvas ref={clientCanvasRef} />
        </div>
      </div>
    </>
  );
};

export default AudioVisualization;
