/*! forma-4d-core — MIT License — Copyright (c) 2026 ZEUS LAB. See LICENSE. */
/* 4D stage (shared by the FORMA hero and /playground/). A tesseract shell blended with a Clifford torus lives in four
   dimensions; it is rotated in the xw, yz, zw and xy planes and sliced at a moving w, and the camera sees that 3D slice.
   WebGL2, one full-screen triangle, resolution scaled to the screen and capped, paused when hidden or off-screen.
   Material 0: champagne-gold metal on obsidian. Material 1: glass with per-channel refraction (prism dispersion).
   The pointer (or a finger) turns the camera through a damped spring; a tap sends one pulse; sound, when switched on
   in the page, drives the slice and the light through the level it reports. Nothing here reads or sends data. */
var H4D = (function () {
  "use strict";
  var VS = "#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FS = "#version 300 es\nprecision highp float;\nuniform vec2 uR,uM,uO;uniform float uT,uK,uL,uH,uB,uX,uS,uD,uW,uQ,uZ;out vec4 fc;\n" +
    "#define TAU 6.2831853\n" +
    "mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}\n" +
    "float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\n" +
    "vec3 spec(float x){return clamp(abs(mod(x*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}\n" +
    "vec4 R4(vec4 p){float a=uT*uS;p.xw*=rot(a+.4);p.yz*=rot(a*.7);p.zw*=rot(a*1.3);p.xy*=rot(-a*.5+.2);return p;}\n" +
    "float sdT(vec4 p,float b,float r){vec4 q=abs(p)-b;return length(max(q,0.))+min(max(max(q.x,q.y),max(q.z,q.w)),0.)-r;}\n" +
    "float sdC(vec4 p,float R1,float R2,float r){return length(vec2(length(p.xy)-R1,length(p.zw)-R2))-r;}\n" +
    "float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}\n" +
    "float map(vec3 p){float w=uQ+.30*sin(uT*.42)+.09*uK;vec4 q=R4(vec4(p,w));float s=1.+.06*uK+.25*uB;q/=s;" +
    "float d1=abs(sdT(q,.60,.05))-uW;float d2=sdC(q,.72,.40,.075+.035*uL);return smin(d1,d2,.16)*s*.72;}\n" +
    "vec3 nor(vec3 p){vec2 e=vec2(.0016,-.0016);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}\n" +
    "vec3 envZ(vec3 r){float y=r.y;vec3 c=mix(vec3(.010,.009,.014),vec3(.07,.055,.04),smoothstep(-.6,.9,y));" +
    "c+=vec3(1.,.86,.62)*(1.-smoothstep(0.,.05,abs(y-.52)))*2.4;c+=vec3(1.,.92,.78)*(1.-smoothstep(0.,.035,abs(r.x-.58)))*smoothstep(-.3,.7,y)*1.4;" +
    "c+=vec3(.95,.72,.42)*pow(max(0.,dot(r,normalize(vec3(-.55,.35,.6)))),18.)*2.2;c+=vec3(.55,.6,.75)*smoothstep(.6,1.,-r.x)*.25;return c;}\n" +
    "vec3 envF(vec3 r){vec3 c=mix(vec3(.025,.022,.05),vec3(.10,.08,.17),smoothstep(-.5,.8,r.y));" +
    "c+=spec(r.x*.7+r.y*.35+.15)*(1.-smoothstep(0.,.22,abs(r.y-.18+.35*r.x)))*1.6;c+=vec3(1.)*(1.-smoothstep(0.,.03,abs(r.y-.62)))*1.7;" +
    "c+=spec(.6+r.z*.5)*pow(max(0.,dot(r,normalize(vec3(.5,.3,.7)))),10.)*1.2;return c;}\n" +
    "vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}\n" +
    "void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/min(uR.x,uR.y)-uO;float a=uT*.11+uM.x*1.4;" +
    "vec3 ro=vec3(3.05*sin(a),.55*sin(uT*.21)+.15+uM.y*1.1,3.05*cos(a));vec3 ww=normalize(-ro),uu=normalize(cross(ww,vec3(0.,1.,0.))),vv=cross(uu,ww);" +
    "float z=(uR.x<uR.y?1.15:1.3)*uZ+.14*uK+.25*uB;vec3 rd=normalize(uv.x*uu+uv.y*vv+z*ww);float r0=length(uv);vec3 bg;" +
    "if(uX<.5){bg=vec3(.0118,.0118,.0196)+vec3(.20,.15,.08)*exp(-r0*r0*2.2)*(.35+.65*uL);}else{bg=vec3(.03,.028,.05)+vec3(.12,.10,.22)*exp(-r0*r0*2.)*(.4+.6*uL)+spec(.62+uv.x*.15)*.04*exp(-r0*r0*1.2);}" +
    "vec2 g=gl_FragCoord.xy/min(uR.x,uR.y)*42.;float st=h21(floor(g));bg+=(uX<.5?vec3(1.,.85,.6):spec(st))*step(.975,st)*(1.-smoothstep(0.,.22,length(fract(g)-.5)))*(.4+.6*sin(uT*2.+st*80.))*(.5+uH*1.5)*.6;" +
    "float t=0.,d;int hit=0;for(int i=0;i<88;i++){d=map(ro+rd*t);if(d<.0013){hit=1;break;}if(t>8.)break;t+=d;}vec3 col=bg;" +
    "if(hit==1){vec3 p=ro+rd*t,n=nor(p);vec3 rf=reflect(rd,n);float fr=pow(1.-max(dot(n,-rd),0.),5.);" +
    "if(uX<.5){vec3 base=vec3(1.,.80,.50);col=(base+(1.-base)*fr)*envZ(rf)*.95+base*.035+vec3(1.,.82,.52)*pow(max(0.,dot(rf,normalize(vec3(.4,.8,.5)))),70.)*1.6+vec3(1.,.78,.45)*pow(1.-abs(dot(n,rd)),6.)*(.25+1.6*uK);}" +
    "else{vec3 tr=vec3(0.);for(int k=0;k<3;k++){float ior=1.46+uD*float(k);vec3 r1=refract(rd,n,1./ior);vec3 s=envF(normalize(r1+n*.25));if(k==0)tr.r=s.r;else if(k==1)tr.g=s.g;else tr.b=s.b;}" +
    "col=mix(tr*1.1,envF(rf),.08+.92*fr)+spec(dot(n,rd)*.8+uT*.05)*pow(1.-abs(dot(n,rd)),3.)*(.35+1.2*uK)+pow(max(0.,dot(rf,normalize(vec3(.5,.8,.4)))),60.)*1.3;}col*=exp(-t*.05);}" +
    "float ring=uB*(1.-smoothstep(0.,.035,abs(r0-(1.-uB)*1.3-.05)));col+=(uX<.5?vec3(1.,.82,.5):spec(r0*1.4+.1))*ring*1.4;" +
    "col=aces(col*1.08);col*=1.-.32*dot(uv,uv);col+=(h21(gl_FragCoord.xy+uT)-.5)*.018;fc=vec4(col,1.);}";
  function spr(s, target, dt, k, d) { var n = Math.ceil(dt / (1 / 240)), h = dt / n; for (var i = 0; i < n; i++) { s.v += (-k * (s.x - target) - d * s.v) * h; s.x += s.v * h; } return s.x; }
  function make(cv, opt) {
    opt = opt || {};
    var gl = cv.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!opt.keep });
    if (!gl) { cv.classList.add("nogl"); return null; }
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; }
    var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { cv.classList.add("nogl"); return null; }
    gl.useProgram(p); var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ["uR", "uM", "uO", "uT", "uK", "uL", "uH", "uB", "uX", "uS", "uD", "uW", "uQ", "uZ"].forEach(function (n) { U[n] = gl.getUniformLocation(p, n); });
    var S = { mat: opt.mat || 0, spin: opt.spin == null ? .45 : opt.spin, disp: opt.disp == null ? .045 : opt.disp, thick: opt.thick == null ? .032 : opt.thick, slice: 0, scale: opt.scale || .7, cap: opt.cap || 1.25,
      level: function () { return null; } };
    var mx = { x: 0, v: 0 }, my = { x: 0, v: 0 }, tx = 0, ty = 0, pulse = 0, last = 0, t = 0, run = true, vis = true, raf = 0, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function size() { var r = cv.getBoundingClientRect(), d = Math.min(S.cap, devicePixelRatio || 1) * S.scale, w = Math.max(2, Math.round(r.width * d)), h = Math.max(2, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } }
    function draw(now) {
      raf = 0; if (!run || !vis) return; var dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; t += dt; size();
      var lv = S.level() || null, L = lv ? lv[0] : .35 + .25 * Math.sin(t * 1.7), H = lv ? lv[1] : .3, K = lv ? lv[2] : Math.pow(Math.max(0, Math.sin(t * 3.0)), 8) * .6;
      pulse = Math.max(0, pulse - dt * 2.2);
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uR, cv.width, cv.height); var wide = cv.width > cv.height * 1.15, off = opt.offset ? (wide ? opt.offset[0] : opt.offset[1]) : [0, 0]; gl.uniform2fv(U.uO, off); gl.uniform2f(U.uM, spr(mx, tx, dt, 60, 11), spr(my, ty, dt, 60, 11));
      gl.uniform1f(U.uT, t); gl.uniform1f(U.uK, K); gl.uniform1f(U.uL, L); gl.uniform1f(U.uH, H); gl.uniform1f(U.uB, pulse * pulse); gl.uniform1f(U.uX, S.mat);
      gl.uniform1f(U.uS, S.spin); gl.uniform1f(U.uD, S.disp); gl.uniform1f(U.uW, S.thick); gl.uniform1f(U.uQ, S.slice); gl.uniform1f(U.uZ, opt.zoom ? (wide ? opt.zoom[0] : opt.zoom[1]) : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3); if (opt.onFrame) opt.onFrame(mx.x, my.x, dt);
      if (!RM) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf && run && vis) raf = requestAnimationFrame(draw); }
    var host = opt.host || cv;
    host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5); ty = -((e.clientY - r.top) / r.height - .5) * .6; if (RM) kick(); }, { passive: true });
    host.addEventListener("pointerleave", function () { tx = 0; ty = 0; });
    host.addEventListener("pointerdown", function (e) { if (e.target.closest && e.target.closest("a,button,input,label,select")) return; pulse = 1; if (RM) kick(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(cv);
    document.addEventListener("visibilitychange", function () { run = !document.hidden; last = 0; kick(); });
    addEventListener("resize", kick);
    kick();
    return { set: function (k, v) { S[k] = v; kick(); }, state: S, pulse: function () { pulse = 1; kick(); }, canvas: cv };
  }
  return { make: make };
})();

if (typeof module === "object" && module.exports) module.exports = H4D;
