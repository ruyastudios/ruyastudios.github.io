import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import lottie from 'lottie-web';

gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   1. Smooth Scroll Setup (Lenis + GSAP ScrollTrigger Integration)
   ========================================================================== */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-style Expo out
  smoothWheel: true,
  wheelMultiplier: 1.0,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const heroCtaBtn = document.querySelector('.hero-cta');
if (heroCtaBtn) {
  heroCtaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo('#portfolio');
  });
}

/* Inline SVG Logos for Theme Color Inheritance (fill="currentColor") */
document.querySelectorAll('img[src*="Ruya Logo.svg"]').forEach(async (img) => {
  try {
    const res = await fetch(img.src);
    const svgText = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = xmlDoc.querySelector('svg');
    if (svgEl) {
      if (img.id) svgEl.id = img.id;
      svgEl.classList.value = img.classList.value;
      svgEl.style.cssText = img.style.cssText;
      svgEl.style.color = 'var(--ink)';
      svgEl.setAttribute('aria-label', img.alt || 'Ruya Logo');
      img.replaceWith(svgEl);
    }
  } catch (e) {
    // Fallback to img tag if fetch fails
  }
});
const cursor = document.getElementById('custom-cursor');
const cursorDot = cursor?.querySelector('.cursor-dot');
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const quickX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
const quickY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

gsap.ticker.add(() => {
  quickX(mouseX);
  quickY(mouseY);
});

const interactives = document.querySelectorAll('a, button, select, textarea, input, .service-card, .portfolio-item');
interactives.forEach((el) => {
  el.addEventListener('mouseenter', () => {
    if (cursorDot) {
      gsap.to(cursorDot, {
        scale: 1.8,
        backgroundColor: '#291C0E',
        duration: 0.2,
      });
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursorDot) {
      gsap.to(cursorDot, {
        scale: 1,
        backgroundColor: '#291C0E',
        duration: 0.2,
      });
    }
  });
});

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    document.body.classList.add('hovering-card');
  });
  card.addEventListener('mouseleave', () => {
    document.body.classList.remove('hovering-card');
  });
});

/* ==========================================================================
   3. Hero Ambient Background Canvas Animation (V2.md #1 Spec)
   ========================================================================== */
const initAmbientCanvas = (canvasId, withSnippets = false) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];

  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    nodes = [];
    const count = Math.floor(width / (withSnippets ? 70 : 100)); // less dense if no snippets
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
      });
    }
  };

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  let floatingTexts = [];
  if (withSnippets) {
    const codeSnippets = [
      'const ruya = build();',
      'stroke: #291C0E;',
      '<RuyaStudio />',
      'display: flex;',
      'motion.animate()',
      'grid-template-columns',
      'render(experience);'
    ];
    for (let i = 0; i < 5; i++) {
      floatingTexts.push({
        text: codeSnippets[i % codeSnippets.length],
        x: Math.random() * (width - 150),
        y: Math.random() * (height - 100),
        vy: -0.2 - Math.random() * 0.3,
        opacity: 0.18 + Math.random() * 0.15,
      });
    }
  }

  const renderBackground = () => {
    ctx.clearRect(0, 0, width, height);

    if (withSnippets) {
      ctx.font = '12px "Fraunces", serif';
      floatingTexts.forEach((ft) => {
        ctx.fillStyle = `rgba(41, 28, 14, ${ft.opacity})`;
        ctx.fillText(ft.text, ft.x, ft.y);
        ft.y += ft.vy;
        if (ft.y < -20) {
          ft.y = height + 20;
          ft.x = Math.random() * (width - 150);
        }
      });
    }

    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(41, 28, 14, 0.22)';
      ctx.fill();
    });

    ctx.lineWidth = 0.7;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(110, 71, 59, ${(1 - dist / 110) * 0.16})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(renderBackground);
  };

  renderBackground();
};

initAmbientCanvas('hero-bg-canvas', true);
initAmbientCanvas('about-bg-canvas', false);

/* ==========================================================================
   4. Hero Gooey Text Morphing Engine (GSAP Timeline)
   ========================================================================== */
const cyclingContainer = document.querySelector('.cycling-word-container');
if (cyclingContainer) {
  const texts = ["Brands", "Logos", "Websites", "Software", "Designs"];
  let currentIndex = 0;

  // Setup DOM elements
  const currentTextEl = cyclingContainer.querySelector('.cycling-word');
  currentTextEl.textContent = texts[currentIndex];
  
  // Initialize width after font load
  document.fonts.ready.then(() => {
    gsap.set(cyclingContainer, { width: currentTextEl.offsetWidth + 'px' });
  });
  
  const nextTextEl = document.createElement('span');
  nextTextEl.className = 'cycling-word';
  nextTextEl.style.position = 'absolute';
  nextTextEl.style.left = '50%';
  nextTextEl.style.transform = 'translateX(-50%)';
  nextTextEl.style.whiteSpace = 'nowrap';
  nextTextEl.style.bottom = '0';
  nextTextEl.style.opacity = '0';
  cyclingContainer.appendChild(nextTextEl);

  function morphNext() {
    const nextIndex = (currentIndex + 1) % texts.length;
    nextTextEl.textContent = texts[nextIndex];

    const tl = gsap.timeline({
      onComplete: () => {
        currentTextEl.textContent = texts[nextIndex];
        gsap.set(currentTextEl, { opacity: 1, y: 0, filter: 'blur(0px)', webkitFilter: 'blur(0px)' });
        gsap.set(nextTextEl, { opacity: 0, y: 0, filter: 'blur(0px)', webkitFilter: 'blur(0px)' });
        currentIndex = nextIndex;
        setTimeout(morphNext, 2500);
      }
    });

    // Smoothly transition overlapping blurred text under SVG threshold matrix for liquid morph
    tl.to(currentTextEl, {
      opacity: 0,
      filter: 'blur(14px)',
      webkitFilter: 'blur(14px)',
      duration: 0.95,
      ease: 'power2.inOut'
    }, 0);

    tl.fromTo(nextTextEl, 
      { opacity: 0, filter: 'blur(14px)', webkitFilter: 'blur(14px)', y: 0 },
      { opacity: 1, filter: 'blur(0px)', webkitFilter: 'blur(0px)', y: 0, duration: 0.95, ease: 'power2.inOut' },
      0
    );
  }

  // Start loop
  setTimeout(morphNext, 2500);
}

/* ==========================================================================
   5. IntersectionObserver scroll reveals
   ========================================================================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
  revealObserver.observe(el);
});

/* ==========================================================================
   6. Portfolio Section List Scroll Reveals & Hover Logics
   ========================================================================== */
const portfolioItems = document.querySelectorAll('.portfolio-item');

// Preemptively load trail-card images to reduce lag on first drag
const trailCards = document.querySelectorAll('.trail-card');
trailCards.forEach(img => {
  if (img.src) {
    const preloader = new Image();
    preloader.src = img.src;
  }
});

if (portfolioItems.length > 0) {
  // Staggered reveal for portfolio items
  gsap.from(portfolioItems, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
    scrollTrigger: {
      trigger: '.portfolio-list.list',
      start: 'top 85%',
      once: true
    }
  });

  // Image hover reveal logic (Ultra-optimized rAF batching, 0 DOM reflows)
  portfolioItems.forEach((item) => {
    const imageContainer = item.querySelector('.portfolio-item__image');
    if (!imageContainer) return;
    
    const cards = Array.from(item.querySelectorAll('.trail-card'));
    if (cards.length !== 4) return;
    
    // Physics & State
    const threshold = 60;
    let lastSpawnPos = { x: -9999, y: -9999 };
    let targetMousePos = { x: 0, y: 0 };
    let currentMousePos = { x: 0, y: 0 };
    let isHovering = false;
    let animFrame = null;
    let isMouseMoved = false;
    
    // Pre-create GSAP quickSetters for high-performance zero-allocation updates
    const setters = cards.map(card => {
      if (typeof gsap !== 'undefined') {
        gsap.set(card, { xPercent: -50, yPercent: -50, scale: 0.96, opacity: 0, force3D: true });
      }
      return {
        card: card,
        xSetter: typeof gsap !== 'undefined' ? gsap.quickSetter(card, "x", "px") : () => {},
        ySetter: typeof gsap !== 'undefined' ? gsap.quickSetter(card, "y", "px") : () => {},
        rotSetter: typeof gsap !== 'undefined' ? gsap.quickSetter(card, "rotation", "deg") : () => {},
        opacitySetter: typeof gsap !== 'undefined' ? gsap.quickSetter(card, "opacity") : () => {},
        scaleSetter: typeof gsap !== 'undefined' ? gsap.quickSetter(card, "scale") : () => {},
        tx: 0, ty: 0, cx: 0, cy: 0, trot: 0, crot: 0,
        targetOpacity: 0, currentOpacity: 0,
        targetScale: 0.96, currentScale: 0.96
      };
    });
    
    let activeCards = [...setters];
    const opacities = [0.75, 0.82, 0.90, 1.0];

    const renderLoop = () => {
      if (!isHovering && activeCards.every(c => c.currentOpacity < 0.01)) {
        activeCards.forEach(c => {
          c.opacitySetter(0);
          c.currentOpacity = 0;
        });
        cancelAnimationFrame(animFrame);
        animFrame = null;
        return;
      }
      
      const portfolioList = document.querySelector('.portfolio-list');
      if (portfolioList && portfolioList.classList.contains('list')) {
        // Smooth cursor velocity rotation
        const dx = targetMousePos.x - currentMousePos.x;
        currentMousePos.x += dx * 0.2;
        currentMousePos.y += (targetMousePos.y - currentMousePos.y) * 0.2;
        
        const velX = Math.max(-30, Math.min(30, dx));
        const targetRotation = Math.max(-4, Math.min(4, velX * 0.15));
        
        // Spawn threshold check
        if (isMouseMoved) {
          const dist = Math.hypot(targetMousePos.x - lastSpawnPos.x, targetMousePos.y - lastSpawnPos.y);
          if (dist > threshold) {
            const oldest = activeCards.shift();
            activeCards.push(oldest);
            lastSpawnPos = { x: targetMousePos.x, y: targetMousePos.y };
            oldest.cx = targetMousePos.x;
            oldest.cy = targetMousePos.y;
            oldest.currentScale = 0.94;
          }
          isMouseMoved = false;
        }

        // Update card physics and render via quickSetters (zero DOM reflows / zero new objects created)
        activeCards.forEach((obj, index) => {
          const offsetIndex = 3 - index;
          obj.tx = currentMousePos.x + (offsetIndex * -12);
          obj.ty = currentMousePos.y + (offsetIndex * 10);
          obj.trot = targetRotation;
          obj.card.style.zIndex = index + 1;

          obj.targetOpacity = isHovering ? opacities[index] : 0;
          obj.targetScale = isHovering ? 1.0 : 0.96;

          // Lerp position, rotation, scale, and opacity
          obj.cx += (obj.tx - obj.cx) * 0.2;
          obj.cy += (obj.ty - obj.cy) * 0.2;
          obj.crot += (obj.trot - obj.crot) * 0.15;
          obj.currentOpacity += (obj.targetOpacity - obj.currentOpacity) * 0.2;
          obj.currentScale += (obj.targetScale - obj.currentScale) * 0.2;

          obj.xSetter(obj.cx);
          obj.ySetter(obj.cy);
          obj.rotSetter(obj.crot);
          obj.opacitySetter(obj.currentOpacity);
          obj.scaleSetter(obj.currentScale);
        });
      }

      animFrame = requestAnimationFrame(renderLoop);
    };

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

    item.addEventListener('mouseenter', (e) => {
      if (isTouchDevice() || (e && e.pointerType === 'touch')) return;
      isHovering = true;
      imageContainer.classList.add('active');
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      targetMousePos = { x, y };
      currentMousePos = { x, y };
      lastSpawnPos = { x, y };
      
      activeCards.forEach((obj, index) => {
        const offsetIndex = 3 - index;
        obj.tx = x + (offsetIndex * -12);
        obj.ty = y + (offsetIndex * 10);
        obj.cx = obj.tx;
        obj.cy = obj.ty;
        obj.trot = 0;
        obj.crot = 0;
        obj.card.style.zIndex = index + 1;
      });

      if (!animFrame) {
        animFrame = requestAnimationFrame(renderLoop);
      }
    });

    item.addEventListener('mouseleave', () => {
      isHovering = false;
      imageContainer.classList.remove('active');
    });

    item.addEventListener('mousemove', (e) => {
      if (isTouchDevice() || (e && e.pointerType === 'touch')) return;
      const rect = item.getBoundingClientRect();
      targetMousePos.x = e.clientX - rect.left;
      targetMousePos.y = e.clientY - rect.top;
      isMouseMoved = true;
    }, { passive: true });
  });

  // Filter Dropdown Toggle
  const filterHeader = document.querySelector('.portfolio-filter__header');
  const filterContainer = document.querySelector('.portfolio-filter');
  
  if (filterHeader && filterContainer) {
    filterHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      filterContainer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!filterContainer.contains(e.target)) {
        filterContainer.classList.remove('open');
      }
    });
  }

  // Filter Logic
  const filterBtns = document.querySelectorAll('.filter-item');
  const portfolioCount = document.querySelector('.portfolio-filter__title .count');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      let visibleCount = 0;

      portfolioItems.forEach(item => {
        const tags = item.getAttribute('data-portfolio-tag') || "";
        if (filterVal === 'all' || tags.includes(filterVal)) {
          gsap.to(item, { display: 'flex', opacity: 1, duration: 0.3 });
          visibleCount++;
        } else {
          gsap.to(item, { display: 'none', opacity: 0, duration: 0.3 });
        }
      });

      if (portfolioCount) {
        portfolioCount.textContent = visibleCount;
      }
      
      filterContainer.classList.remove('open');
      setTimeout(() => ScrollTrigger.refresh(), 350);
    });
  });
}

/* ==========================================================================
   7. Compact Contact Modal (V2.md #5)
   ========================================================================== */
const contactModal = document.getElementById('contact-modal');
const openContactBtn = document.getElementById('open-contact-modal');
const navCtaBtn = document.getElementById('nav-cta-btn');
const closeContactBtn = document.getElementById('close-contact-modal');

const openContactModal = (e) => {
  if (e) e.preventDefault();
  contactModal?.showModal();
  lenis.stop();
};

const closeContactModal = () => {
  contactModal?.close();
  lenis.start();
};

openContactBtn?.addEventListener('click', openContactModal);
navCtaBtn?.addEventListener('click', openContactModal);
closeContactBtn?.addEventListener('click', closeContactModal);

contactModal?.addEventListener('click', (e) => {
  if (e.target === contactModal) {
    closeContactModal();
  }
});

// Form Submission State Handling
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitBtn = contactForm.querySelector('.btn-submit');
  const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Request';

  if (submitBtn) {
    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;
  }
  if (formStatus) formStatus.className = 'form-status';

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
    if (formStatus) {
      formStatus.innerText = "Thank you! We've received your request and will get back to you shortly.";
      formStatus.classList.add('success');
    }
    contactForm.reset();
  }, 1200);
});

/* ==========================================================================
   9. Footer Animated Loader Cat (V2.md #6 Spec)
   ========================================================================== */
const lottieContainer = document.getElementById('cat-lottie-container');
if (lottieContainer) {
  const lottieCanvas = document.createElement('canvas');
  lottieCanvas.id = 'cat-lottie-canvas';
  lottieCanvas.style.width = '100%';
  lottieCanvas.style.height = '100%';
  lottieContainer.appendChild(lottieCanvas);

  new DotLottie({
    autoplay: true,
    loop: true,
    canvas: lottieCanvas,
    src: '/uVuvQ1mZqC.json?v=' + (Date.now() + 1),
  });
}

/* ==========================================================================
   8. Annotations & Inspector Motifs
   ========================================================================== */
function drawAnnotations() {
  // Lock cascade height to prevent section expansion on card hover
  const cascade = document.querySelector('.services-cascade');
  if (cascade) {
    cascade.style.height = 'auto';
    cascade.style.height = cascade.offsetHeight + 'px';
  }

  const svg = document.getElementById('services-annotations');
  if (!svg) return;
  const container = svg.parentElement;
  const containerRect = container.getBoundingClientRect();
  svg.innerHTML = ''; // clear existing

  const strokeColor = 'rgba(41, 28, 14, 0.2)';

  const createText = (x, y, str) => {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('fill', strokeColor);
    text.setAttribute('font-size', '10px');
    text.setAttribute('font-family', 'monospace');
    text.textContent = str;
    svg.appendChild(text);
  };

  const drawHandDrawnCrosshair = (cx, cy, withArc = false, arcPos = 'BR') => {
    // Generate slight wobble offsets for hand-drawn feel
    const wobble = () => (Math.random() - 0.5) * 3;
    
    // Horizontal line
    const hPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const hExt = 25;
    hPath.setAttribute('d', `M ${cx - hExt} ${cy + wobble()} Q ${cx} ${cy + wobble()} ${cx + hExt} ${cy + wobble()}`);
    hPath.setAttribute('stroke', strokeColor);
    hPath.setAttribute('stroke-width', '1');
    hPath.setAttribute('fill', 'none');
    svg.appendChild(hPath);

    // Vertical line
    const vPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const vExt = 25;
    vPath.setAttribute('d', `M ${cx + wobble()} ${cy - vExt} Q ${cx + wobble()} ${cy} ${cx + wobble()} ${cy + vExt}`);
    vPath.setAttribute('stroke', strokeColor);
    vPath.setAttribute('stroke-width', '1');
    vPath.setAttribute('fill', 'none');
    svg.appendChild(vPath);

    if (withArc) {
      const r = 12;
      let arcD = '';
      let tx = cx, ty = cy;
      
      if (arcPos === 'TL') {
        arcD = `M ${cx},${cy + r} A ${r} ${r} 0 0 1 ${cx + r},${cy}`;
        tx = cx + r + 2; ty = cy + r + 4;
      } else if (arcPos === 'TR') {
        arcD = `M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx},${cy + r}`;
        tx = cx - r - 22; ty = cy + r + 4;
      } else if (arcPos === 'BL') {
        arcD = `M ${cx + r},${cy} A ${r} ${r} 0 0 1 ${cx},${cy - r}`;
        tx = cx + r + 2; ty = cy - r + 2;
      } else if (arcPos === 'BR') {
        arcD = `M ${cx},${cy - r} A ${r} ${r} 0 0 1 ${cx - r},${cy}`;
        tx = cx - r - 22; ty = cy - r + 2;
      }
      
      const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arcPath.setAttribute('d', arcD);
      arcPath.setAttribute('stroke', strokeColor);
      arcPath.setAttribute('stroke-width', '1');
      arcPath.setAttribute('fill', 'none');
      svg.appendChild(arcPath);
      
      createText(tx, ty, 'R12');
    }
  };

  const cards = document.querySelectorAll('.svc-card');
  if (cards.length > 0) {
    const getCoord = (card, edgeX, edgeY) => {
      const rect = card.getBoundingClientRect();
      return {
        x: rect[edgeX] - containerRect.left,
        y: rect[edgeY] - containerRect.top
      };
    };

    cards.forEach((card, i) => {
       const br = getCoord(card, 'right', 'bottom');
       const bl = getCoord(card, 'left', 'bottom');
       const tr = getCoord(card, 'right', 'top');
       
       // Draw hand-drawn crosshairs only at select intersection points instead of every corner
       if (i === 0) {
           drawHandDrawnCrosshair(br.x, br.y, true, 'BR');
       } else if (i === 1) {
           drawHandDrawnCrosshair(bl.x, bl.y, true, 'BL');
       } else if (i === 2) {
           drawHandDrawnCrosshair(tr.x, tr.y, true, 'TR');
       }
    });
  }

  // Dimension Line Utility
  const drawDimensionLine = (el1, edge1Y, el2, edge2Y, xOffset, label) => {
    if (!el1 || !el2) return;
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const y1 = r1[edge1Y] - containerRect.top;
    const y2 = r2[edge2Y] - containerRect.top;
    const x = r1.left - containerRect.left + xOffset;
    const midY = (y1 + y2) / 2;
    
    const dPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dPath.setAttribute('d', `M ${x - 4} ${y1} L ${x + 4} ${y1} M ${x} ${y1} L ${x} ${y2} M ${x - 4} ${y2} L ${x + 4} ${y2}`);
    dPath.setAttribute('stroke', strokeColor);
    dPath.setAttribute('stroke-width', '1');
    dPath.setAttribute('fill', 'none');
    svg.appendChild(dPath);

    const dist = Math.abs(y2 - y1);
    createText(x + 10, midY + 4, `${Math.round(dist)}px`);
  };

  const servicesHeader = document.querySelector('.services-header-col');
  const firstCard = cards ? cards[0] : null;
  if (servicesHeader && firstCard) drawDimensionLine(servicesHeader, 'bottom', firstCard, 'top', 40, 'gap');
}

window.addEventListener('resize', drawAnnotations);
setTimeout(drawAnnotations, 500);

/* ==========================================================================
   9. GSAP Scroll Snapping (Replaces Native CSS)
   ========================================================================== */
const sections = document.querySelectorAll('section:not(.portfolio-section)');

sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=150',
    snap: {
      snapTo: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    }
  });
});

/* ==========================================================================
   10. Interactive UI Selection Box (Hero)
   ========================================================================== */
const selectionBox = document.querySelector('.ui-selection-box');
const handles = document.querySelectorAll('.ui-handle');

if (selectionBox) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialScale = 1;

  handles.forEach(handle => {
    handle.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initialScale = gsap.getProperty(selectionBox, 'scale') || 1;
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      const isOutward = (dx > 0 || dy > 0); 
      let scaleDelta = isOutward ? (distance / 150) : -(distance / 150);
      const rect = selectionBox.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distFromCenterStart = Math.hypot(startX - centerX, startY - centerY);
      const distFromCenterCurrent = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      let newScale = initialScale * (distFromCenterCurrent / distFromCenterStart);
      newScale = Math.min(Math.max(newScale, 0.5), 1.5);
      gsap.to(selectionBox, { scale: newScale, duration: 0.1, ease: 'power1.out' });
    });

    handle.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      handle.releasePointerCapture(e.pointerId);
      gsap.to(selectionBox, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ==========================================================================
   11. Navbar Scroll Visibility Logic
   ========================================================================== */
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    // Show header when scrolled past 150px
    if (window.scrollY > 150) {
      header.classList.add('nav-visible');
    } else {
      header.classList.remove('nav-visible');
    }
  });
}

/* ==========================================================================
   Project Details Modal Logic
   ========================================================================== */
const projectData = {
  "araknid": {
    title: "Araknid",
    role: "Sole developer and designer",
    year: "2026",
    overview: "Araknid is an experimental visual programming interface built as an alternative to conventional, text-based code editors. Instead of typing syntax, it lets developers construct programs through a spatial, interaction-driven canvas — exploring how visual thinking can stand alongside, or in place of, traditional code.",
    approach: "Combined system design with creative interface exploration, running rapid prototyping cycles across several interaction paradigms — node-based canvases, gesture-driven blocks, and live-preview panels — before converging on the current model.",
    outcome: "A working prototype that demonstrates a genuinely alternative developer experience, used as a personal proof of concept for non-traditional programming interfaces.",
    images: ["/src/works/Araknid/1.jpg", "/src/works/Araknid/2.jpg", "/src/works/Araknid/3.jpg", "/src/works/Araknid/4.jpg"]
  },
  "seven-years": {
    title: "Seven Years",
    role: "Designer",
    year: "2026",
    overview: "A series of social-first creative for Seven Years Baby Shop (Vadakara, Perambra), a baby and kids retail store. The campaign spans seasonal promotions, emotional brand storytelling, and product-led placement, all built for Instagram-first distribution.",
    approach: "Each piece is anchored on a single emotional hook and paired with bold typography and photo or illustration composites, built for quick, scroll-stopping impact in a social feed.",
    outcome: "A cohesive visual campaign covering a Back-to-School seasonal push, a Social Media Day piece, and an evergreen brand piece built around \"make every moment count,\" all published under the shop's Instagram handle.",
    images: ["/src/works/Seven Years/1.jpg", "/src/works/Seven Years/2.jpg", "/src/works/Seven Years/3.jpg", "/src/works/Seven Years/4.jpg"]
  },
  "behavioral-auth": {
    title: "Behavioral Biometric Auth",
    role: "Technical mentor and contributing architect",
    year: "2026",
    overview: "A behavioral biometric authentication system built around cognitive mapping — authenticating users based on patterns in how they think and interact, rather than static credentials. Developed as a final-year academic collaboration.",
    approach: "Combined behavioral pattern capture with a cognitive-mapping model to produce an authentication signal that's harder to spoof than a password or a static biometric.",
    outcome: "A working academic prototype demonstrating an alternative authentication approach, delivered with full technical documentation and a project presentation.",
    images: ["/src/works/Behavioral Biometric Auth/1.jpg", "/src/works/Behavioral Biometric Auth/2.jpg", "/src/works/Behavioral Biometric Auth/3.jpg", "/src/works/Behavioral Biometric Auth/4.jpg"]
  },
  "rayyan-international": {
    title: "Rayyan International",
    role: "Logo and brand designer",
    year: "2026",
    overview: "A corporate identity project for Rayyan International, centered on a geometric \"R\" monogram mark.",
    approach: "The monogram is built from interlocking negative space so the \"R\" reads clearly at both icon and word-mark scale, paired with a clean serif \"INTERNATIONAL\" lockup for a formal, corporate register.",
    outcome: "A primary logo mark delivered for use across brand touchpoints and backgrounds.",
    images: ["/src/works/Logos/Rayyan-1.jpg", "/src/works/Logos/Rayyan-2.jpg", "/src/works/Logos/Rayyan-3.jpg", "/src/works/Logos/Rayyan-4.jpg"]
  },
  "mercury": {
    title: "Mercury",
    role: "Designer and architect",
    year: "2025",
    overview: "Mercury is an experimental, decentralized, multi-channel messaging architecture concept, exploring scalable alternatives to centralized communication models.",
    approach: "Designed a distributed message-routing model in place of a single centralized server, and prototyped real-world use cases to test the model's scalability and communication patterns.",
    outcome: "An architectural prototype and use-case set demonstrating the decentralized messaging model.",
    images: ["/src/works/Mercury/1.jpg", "/src/works/Mercury/2.jpg", "/src/works/Mercury/3.jpg", "/src/works/Mercury/4.jpg"]
  },
  "branding-and-logos": {
    title: "Rayyan & Crescent Italy",
    role: "Logo & Brand Identity Designer",
    year: "2026",
    overview: "A dual corporate identity suite crafted for Rayyan International and Crescent Italy. This collection explores vector precision, negative space balance, and distinct brand positioning tailored for modern international commerce and regional retail identity.",
    approach: "For Rayyan International, developed a geometric 'R' monogram constructed from interlocking negative space to embody structure and corporate authority. For Crescent Italy, authored a dynamic crescent motif paired with high-contrast typography, evoking fluid motion and contemporary Italian elegance.",
    outcome: "Delivered primary logo marks, brand identity guidelines, and scalable vector suites optimized across digital applications, stationery, and physical touchpoints.",
    images: ["/src/works/Logos/1.jpg", "/src/works/Logos/2.jpg", "/src/works/Logos/3.jpg", "/src/works/Logos/4.jpg"]
  },
  "lysis-grafx": {
    title: "Lysis Grafx",
    role: "Designer",
    year: "2026",
    overview: "A series of stylized football fan-art and tribute posters published under the \"Lysis Grafx\" name, blending photo composition with bold typographic treatments.",
    approach: "Photo manipulation and compositing paired with dramatic typographic treatment, built for square and portrait social formats.",
    outcome: "A growing catalogue of tribute and hype posters distributed on social media.",
    images: ["/src/works/Lysis Grafx/1.jpg", "/src/works/Lysis Grafx/2.jpg", "/src/works/Lysis Grafx/3.jpg", "/src/works/Lysis Grafx/4.jpg"]
  },
  "client-web-platforms": {
    title: "Client Web Platforms",
    role: "Freelance developer, full lifecycle ownership",
    year: "2022–Present",
    overview: "Freelance software development work delivered for international clients across Saudi Arabia and Egypt, spanning full web platforms built to support live business operations.",
    approach: "Requirement analysis, architecture, and build aligned to each client's real operational workflows, with automation layered in to cut down manual effort.",
    outcome: "Multiple production platforms launched and in active use for client operations, spanning 3+ years of freelance engagements.",
    images: ["/src/works/Client%20Web%20Platforms/1.png", "/src/works/Client%20Web%20Platforms/2.png", "/src/works/Client%20Web%20Platforms/3.png", "/src/works/Client%20Web%20Platforms/4.png"]
  }
};

const projectModal = document.getElementById('project-modal');
const closeProjectModalBtn = document.getElementById('close-project-modal');
const projectCases = document.querySelectorAll('.portfolio-case');

if (projectModal && closeProjectModalBtn && projectCases.length) {
  projectCases.forEach(project => {
    project.addEventListener('click', (e) => {
      e.preventDefault();
      
      const projectId = project.dataset.project;
      const data = projectData[projectId];
      
      if (data) {
        document.getElementById('pm-title').textContent = data.title;
        document.getElementById('pm-role').textContent = data.role;
        document.getElementById('pm-year').textContent = data.year;
        document.getElementById('pm-overview').textContent = data.overview;
        document.getElementById('pm-approach').textContent = data.approach;
        document.getElementById('pm-outcome').textContent = data.outcome;
        
        const galleryEl = document.getElementById('pm-media-gallery');
        if (galleryEl && data.images && data.images.length) {
          const images = data.images;
          let currentSlide = 0;

          // Build carousel HTML
          galleryEl.innerHTML = `
            <div class="pm-carousel">
              <div class="pm-carousel__track-wrap">
                <div class="pm-carousel__track">
                  ${images.map((src, i) => `
                    <div class="pm-carousel__slide ${i === 0 ? 'is-active' : ''}">
                      <img src="${src}" alt="${data.title} preview ${i + 1}" class="pm-carousel__img" onerror="this.parentElement.style.display='none'" />
                    </div>
                  `).join('')}
                </div>
              </div>
              ${images.length > 1 ? `
                <button class="pm-carousel__btn pm-carousel__btn--prev" aria-label="Previous image">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button class="pm-carousel__btn pm-carousel__btn--next" aria-label="Next image">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <div class="pm-carousel__dots">
                  ${images.map((_, i) => `<button class="pm-carousel__dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`).join('')}
                </div>
              ` : ''}
            </div>
          `;

          if (images.length > 1) {
            const track = galleryEl.querySelector('.pm-carousel__track');
            const slides = galleryEl.querySelectorAll('.pm-carousel__slide');
            const dots = galleryEl.querySelectorAll('.pm-carousel__dot');
            const prevBtn = galleryEl.querySelector('.pm-carousel__btn--prev');
            const nextBtn = galleryEl.querySelector('.pm-carousel__btn--next');

            const goTo = (index) => {
              slides[currentSlide].classList.remove('is-active');
              dots[currentSlide].classList.remove('is-active');
              currentSlide = (index + images.length) % images.length;
              slides[currentSlide].classList.add('is-active');
              dots[currentSlide].classList.add('is-active');
              track.style.transform = `translateX(-${currentSlide * 100}%)`;
            };

            prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
            nextBtn.addEventListener('click', () => goTo(currentSlide + 1));
            dots.forEach(dot => {
              dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
            });

            // Store cleanup ref
            galleryEl._carouselKeyHandler && window.removeEventListener('keydown', galleryEl._carouselKeyHandler);
            galleryEl._carouselKeyHandler = (e) => {
              if (!projectModal.open) return;
              if (e.key === 'ArrowLeft') goTo(currentSlide - 1);
              if (e.key === 'ArrowRight') goTo(currentSlide + 1);
            };
            window.addEventListener('keydown', galleryEl._carouselKeyHandler);
          }
        }
      } else {
        // Fallback for missing data
        const h3 = project.querySelector('h3');
        let title = "Project";
        if (h3) {
          title = h3.childNodes[0].textContent.trim();
        }
        document.getElementById('pm-title').textContent = title;
      }
      
      projectModal.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  
  const closeProjectModal = () => {
    projectModal.close();
    document.body.style.overflow = '';
  };
  
  closeProjectModalBtn.addEventListener('click', closeProjectModal);
  
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal || e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-inner')) {
      closeProjectModal();
    }
  });
}
