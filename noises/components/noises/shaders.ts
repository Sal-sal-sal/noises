import { NoiseId } from "./types";

export const FRAGMENT_SHADERS: Record<NoiseId, string> = {
  white: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    float rand(vec2 st){ return fract(sin(dot(st, vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      vec2 uv = gl_FragCoord.xy / resolution;
      float n = rand(uv + fract(time * 0.1));
      gl_FragColor = vec4(n, n*0.1, n*0.05, 1.0);
    }
  `,

  perlin: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    vec2 fade(vec2 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
    float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    vec2 grad(vec2 p){ float r=rand(p); float a=r*6.2831853; return vec2(cos(a),sin(a)); }
    float perlin(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p); vec2 u=fade(f);
      float a=dot(grad(i),f);
      float b=dot(grad(i+vec2(1,0)),f-vec2(1,0));
      float c=dot(grad(i+vec2(0,1)),f-vec2(0,1));
      float d=dot(grad(i+vec2(1,1)),f-vec2(1,1));
      return mix(mix(a,b,u.x),mix(c,d,u.x),u.y)*0.5+0.5;
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / resolution * 4.0;
      float n = perlin(uv + time * 0.3);
      gl_FragColor = vec4(n, n*0.15, n*0.08, 1.0);
    }
  `,

  worley: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    vec2 randv(vec2 p){ return vec2(rand(p), rand(p+vec2(3.7,1.9))); }
    float worley(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p);
      float minDist=9999.0;
      for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++){
        vec2 nb=vec2(float(x),float(y));
        vec2 pt=0.5+0.5*sin(time*0.4+6.2831*randv(i+nb));
        minDist=min(minDist,length(nb+pt-f));
      }
      return minDist;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution*5.0;
      float n=worley(uv);
      gl_FragColor=vec4(n,n*0.1,n*0.05,1.0);
    }
  `,

  fbm: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    vec2 grad(vec2 p){ float r=rand(p); float a=r*6.2831853; return vec2(cos(a),sin(a)); }
    vec2 fade(vec2 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
    float perlin(vec2 p){
      vec2 i=floor(p);vec2 f=fract(p);vec2 u=fade(f);
      return mix(mix(dot(grad(i),f),dot(grad(i+vec2(1,0)),f-vec2(1,0)),u.x),
                 mix(dot(grad(i+vec2(0,1)),f-vec2(0,1)),dot(grad(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y)*0.5+0.5;
    }
    float fbm(vec2 p){
      float v=0.0; float a=0.5;
      for(int i=0;i<6;i++){ v+=a*perlin(p); p=p*2.0+vec2(3.1,1.7); a*=0.5; }
      return v;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution*3.0;
      float n=fbm(uv+time*0.15);
      gl_FragColor=vec4(n,n*0.12,n*0.06,1.0);
    }
  `,

  // Fixed: use normalized centered UV so the warp is symmetric on screen
  domain: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;

    float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    vec2 grad(vec2 p){ float r=rand(p); float a=r*6.2831853; return vec2(cos(a),sin(a)); }
    vec2 fade(vec2 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float perlin(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p); vec2 u=fade(f);
      return mix(
        mix(dot(grad(i),f), dot(grad(i+vec2(1,0)),f-vec2(1,0)), u.x),
        mix(dot(grad(i+vec2(0,1)),f-vec2(0,1)), dot(grad(i+vec2(1,1)),f-vec2(1,1)), u.x),
        u.y
      )*0.5+0.5;
    }

    float fbm(vec2 p){
      float v=0.0; float a=0.5;
      for(int i=0;i<5;i++){ v+=a*perlin(p); p=p*2.0+vec2(3.1,1.7); a*=0.5; }
      return v;
    }

    void main(){
      // centered UV — fixes the off-center issue
      vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y) * 3.0;

      vec2 q = vec2(
        fbm(uv + vec2(0.0, 0.0) + time * 0.08),
        fbm(uv + vec2(5.2, 1.3) + time * 0.08)
      );
      vec2 r = vec2(
        fbm(uv + 4.0*q + vec2(1.7, 9.2) + time * 0.06),
        fbm(uv + 4.0*q + vec2(8.3, 2.8) + time * 0.06)
      );
      float n = fbm(uv + 4.0*r + time * 0.04);

      gl_FragColor = vec4(n, n*0.1, n*0.04, 1.0);
    }
  `,

  ridged: `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    float rand(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    vec2 grad(vec2 p){ float r=rand(p); float a=r*6.2831853; return vec2(cos(a),sin(a)); }
    vec2 fade(vec2 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
    float perlin(vec2 p){
      vec2 i=floor(p);vec2 f=fract(p);vec2 u=fade(f);
      return mix(mix(dot(grad(i),f),dot(grad(i+vec2(1,0)),f-vec2(1,0)),u.x),
                 mix(dot(grad(i+vec2(0,1)),f-vec2(0,1)),dot(grad(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y)*0.5+0.5;
    }
    float ridged(vec2 p){
      float v=0.0; float a=0.5; float w=1.0;
      for(int i=0;i<6;i++){
        float n=1.0-abs(perlin(p)*2.0-1.0);
        n=n*n*w; v+=n*a; w=clamp(n*2.0,0.0,1.0);
        p=p*2.1+vec2(1.9,4.3); a*=0.5;
      }
      return v;
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/resolution*3.0;
      float n=ridged(uv+time*0.12);
      gl_FragColor=vec4(n,n*0.1,n*0.04,1.0);
    }
  `,
};
