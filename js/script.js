console.log('🚀 script.js loaded, custom cursor init');

document.addEventListener("DOMContentLoaded", () => {
  // — 히어로 전용 전환 로직 가드 시작 —
  const enterBtn = document.getElementById("enter-site");
  if (enterBtn) {
    const hero     = document.getElementById("hero");
    const mainSite = document.getElementById("main-site");
    enterBtn.addEventListener("click", () => {
      hero.style.opacity = "0";
      setTimeout(() => {
        hero.style.display  = "none";
        mainSite.style.display = "block";
      }, 800);
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Custom Cursor
  const cursor = document.getElementById("cursor");
  if (cursor) {
    window.addEventListener("mousemove", e => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top  = e.clientY + "px";
    });
    document.querySelectorAll("a, button, input, textarea, .gallery-item")
      .forEach(el => {
        el.addEventListener("mouseenter", () => cursor.classList.add("hovered"));
        el.addEventListener("mouseleave", () => cursor.classList.remove("hovered"));
      });
  }
  // Works gallery filtering
  document.querySelectorAll('.works-list a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.works-list a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      const targetEl = document.getElementById(link.getAttribute('href').slice(1));
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Project group toggle
  const projectGroups = document.querySelectorAll('.project-group');
  const projectLinks  = document.querySelectorAll('.works-list a');
  projectGroups.forEach((g, i) => g.classList.toggle('active', i === 0));
  projectLinks.forEach((l, i) => l.classList.toggle('active', i === 0));
  projectLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      projectLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      projectGroups.forEach(g => g.classList.toggle('active', g.id === targetId));
    });
  });

  // Hero bubble interaction with proper pop effect
  const canvas = document.getElementById('bubble-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!canvas || !ctx) return;

  // resize canvas
  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  // custom SVG path
  const customPath = new Path2D(
    "M0,-1 L0.224,-0.309 L0.951,-0.309 L0.363,0.118 " +
    "L0.588,0.809 L0,0.382 L-0.588,0.809 L-0.363,0.118 " +
    "L-0.951,-0.309 L-0.224,-0.309 Z"
  );
  
  class Bubble {
    constructor(x, y) {
      this.x = x; this.y = y;
      this.r = 0;
      this.maxR = 20 + Math.random() * 80;
      this.growth = 0.05 + Math.random() * 0.2;
      this.path = customPath;
      const hue = Math.random() * 360;
      this.fillColor = `hsla(${hue},70%,60%,0.3)`;
    }
    update() { if (this.r < this.maxR) this.r += this.growth; }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.r, this.r);
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.fillColor;
      ctx.fill(this.path);
      ctx.restore();
    }
    isPointInside(px, py) {
      const dx = px - this.x, dy = py - this.y;
      return dx * dx + dy * dy <= this.r * this.r;
    }
  }

  class Pop {
    constructor(x, y, startR, path, fillColor) {
      this.x = x;
      this.y = y;
      this.initialR = startR;     // 클릭 직전 버블 크기
      this.r = startR;            // 팝 시작 크기
      this.maxR = startR * 2;     // 최대 확장 크기
      this.alpha = 0.9;             // 투명도
      this.path = path;           // SVG Path2D
      this.fillColor = fillColor; // 원본 버블 색상
    }
  
    update() {
      // 순간 팽창 & 빠른 페이드아웃
      this.r     += (this.maxR - this.r) * 0.4;
      this.alpha -= 0.05;
    }
  
    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
  
      // 크기 비율 계산
      ctx.scale(this.r, this.r);
  
      // 알파 적용 & SVG 채우기
      ctx.globalAlpha = this.alpha;
      const solidColor = this.fillColor.replace(/, *0?\.?\d+\)$/, ',1)');
      ctx.fillStyle   = this.fillColor;
      ctx.fill(this.path);
  
      ctx.restore();
      ctx.globalAlpha = 1;  // 다른 그리기에 영향 방지
    }
  }



  const bubbles = [];
  const pops = [];
  setInterval(() => {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    bubbles.push(new Bubble(x, y));
    if (bubbles.length > 50) bubbles.shift();
  }, 500);

  const getLocalXY = e => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  canvas.addEventListener('click', e => {
    const { x: mx, y: my } = getLocalXY(e);
    for (let i = bubbles.length - 1; i >= 0; i--) {
      if (bubbles[i].isPointInside(mx, my)) {
        // 삭제된 버블 객체 가져오기
        const [removed] = bubbles.splice(i, 1);
        // Pop 생성 (원본 색상까지 넘김)
        pops.push(new Pop(
          removed.x,
          removed.y,
          removed.r,
          removed.path,
          removed.fillColor
        ));
        break;
      }
    }
  });
  

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // 1) 원래 버블
    bubbles.forEach(b => { b.update(); b.draw(); });
  
    // 2) Pop 효과
    for (let i = pops.length - 1; i >= 0; i--) {
      pops[i].update();
      pops[i].draw();
      if (pops[i].alpha <= 0) pops.splice(i, 1);
    }
    requestAnimationFrame(animate);
  })();
});
