import { useEffect, useRef } from "react";
import { NoiseId } from "./types";
import { FRAGMENT_SHADERS } from "./shaders";

const VS_SOURCE = `attribute vec2 pos; void main(){ gl_Position=vec4(pos,0,1); }`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("[shader error]", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function useWebGL(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  activeNoise: NoiseId,
  color: [number, number, number]
) {
  const frameRef = useRef<number>(0);
  const colorRef = useRef(color);
  colorRef.current = color; // обновляем без ре-рендера шейдера

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADERS[activeNoise]);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("[program error]", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, "pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc  = gl.getUniformLocation(prog, "time");
    const resLoc   = gl.getUniformLocation(prog, "resolution");
    const colorLoc = gl.getUniformLocation(prog, "uColor");

    cancelAnimationFrame(frameRef.current);

    function render(t: number) {
      const [r, g, b] = colorRef.current;
      gl!.uniform1f(timeLoc, t * 0.001);
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl!.uniform3f(colorLoc, r, g, b);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      frameRef.current = requestAnimationFrame(render);
    }
    frameRef.current = requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
      gl.deleteProgram(prog);
    };
  }, [activeNoise]);
}