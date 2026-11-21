window.SprayVFX = (function () {
  let canvas = null;
  let ctx = null;
  let droplets = [];
  let rafId = null;

  function initCanvas() {
    canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    droplets = droplets.filter((d) => {
      d.x += d.vx;
      d.y += d.vy;
      d.vy += d.gravity;
      d.alpha -= d.fade;
      if (d.alpha <= 0) return false;
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.alpha);
      if (d.ring) {
        d.radius += 1.6;
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    });
    if (droplets.length > 0) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function splatterAt(selectorOrEl, colorHex = "#00e5ff", isCleanse = false) {
    const target = typeof selectorOrEl === "string" ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!target) return;
    if (!canvas) initCanvas();
    const r = target.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    if (isCleanse) {
      for (let i = 0; i < 4; i++) {
        droplets.push({ x: cx, y: cy, vx: 0, vy: 0, gravity: 0, radius: 10 + i * 8, color: colorHex, alpha: 0.9, fade: 0.035, ring: true });
      }
    } else {
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1.5 + Math.random() * 4.5;
        droplets.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1.5, gravity: 0.14, radius: 2.5 + Math.random() * 4, color: colorHex, alpha: 1, fade: 0.03, ring: false });
      }
      for (let i = 0; i < 4; i++) {
        droplets.push({ x: cx + (Math.random() - 0.5) * 36, y: cy, vx: 0, vy: 1.5 + Math.random() * 1.5, gravity: 0.12, radius: 2.5, color: colorHex, alpha: 0.95, fade: 0.022, ring: false });
      }
    }
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  return { splatterAt };
})();
