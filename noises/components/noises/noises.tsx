'use client';
import { useEffect, useRef, useState } from "react";

export default function Noises() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [noises, setNoises] = useState(0);
  const noiseRef = useRef(0); // ← реф для передачи в WebGL

  const handlegausian = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const val = Math.random();
        setNoises(val);
        noiseRef.current = val; // ← обновляем реф, шейдер его увидит
      }, i * 100 + 100);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vertexShaderSource = `
      attribute vec2 position;
      void main(){
        gl_Position = vec4(position,0.0,1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform float noiseVal; // ← новый uniform
      uniform vec2 resolution;

      float random(vec2 st){
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float noise = random(uv + time*0.1 + noiseVal); // ← используем noiseVal как seed
        // Красный шум: только R канал
        gl_FragColor = vec4(noise, 0.0, 0.0, 1.0);
      }
    `;

    function createShader(type: number, source: string): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "time");
    const resLoc = gl.getUniformLocation(program, "resolution");
    const noiseLoc = gl.getUniformLocation(program, "noiseVal"); // ← новый локейшн

    let frameId: number;
    function render(t: number) {
      gl!.uniform1f(timeLoc!, t * 0.001);
      gl!.uniform1f(noiseLoc!, noiseRef.current); // ← передаём значение из рефа
      gl!.uniform2f(resLoc!, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    }

    frameId = requestAnimationFrame(render);

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex flex-col relative items-center h-screen w-screen justify-center">
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />
      <div className="flex flex-col gap-4 h-[20%] w-[20%] bg-[#2A2A2A] rounded-2xl items-center justify-center relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[radial-gradient(circle,_rgba(255,255,255,0.3),_transparent)] rounded-full blur-3xl" />
        <div className="justify-center items-center flex flex-col w-full h-full gap-20">
          <div className="flex justify-center items-center bg-[#333333] rounded-2xl w-[50%] h-20">
            {noises.toFixed(4)}
          </div>
          <button
            className="bg-[#383838] bg-[radial-gradient(circle,_rgba(255,255,255,0.3),_transparent)] w-[60%] h-20 rounded-2xl"
            onClick={handlegausian}
          >
            Generate random noise
          </button>
        </div>
      </div>
    </div>
  );
}