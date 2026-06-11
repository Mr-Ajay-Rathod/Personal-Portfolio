  

// ============================
// PORTFOLIO FLIPBOOK — Advanced Interactions & Drag-to-Flip
// ============================

(function () {
  'use strict';

  // ---- DOM Elements ----
  const scaleWrapper = document.getElementById('scaleWrapper');
  const rotateOverlay = document.getElementById('rotateOverlay');

  const pages = Array.from(document.querySelectorAll('.book-page.turnable'));
  const nextBtns = document.querySelectorAll('.next-btn');
  const prevBtns = document.querySelectorAll('.prev-btn');

  const contactMeBtn = document.getElementById('contactMeBtn');
  const backProfileBtn = document.getElementById('backProfileBtn');
  const coverRight = document.querySelector('.cover.cover-right');
  const pageLeft = document.querySelector('.book-page.page-left');

  const pageDots = document.querySelectorAll('.page-dots .dot');

  let totalPages = pages.length;
  let currentPage = 0; // 0 = profile view, 1-3 = turned pages

  // ---- Auto Scaling Engine ----
  // Base dimensions based on 66rem x 45rem (assuming 1rem = 16px) -> 1056 x 720
  const BASE_WIDTH = 1056;
  const BASE_HEIGHT = 720;

  let forceRotated = false;
  const continueRotatedBtn = document.getElementById('continueRotatedBtn');

  if (continueRotatedBtn) {
    continueRotatedBtn.addEventListener('click', () => {
      forceRotated = true;
      applyScaling();
    });
  }

  function applyScaling() {
    if (!scaleWrapper) return;

    // Check if device is mobile portrait
    if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
      if (!forceRotated) {
        rotateOverlay.style.display = 'flex';
        scaleWrapper.style.display = 'none';
        return;
      } else {
        rotateOverlay.style.display = 'none';
        scaleWrapper.style.display = 'flex';

        // Calculate scale mapping width to screen height and height to screen width
        const availableWidth = window.innerHeight - 32;
        const availableHeight = window.innerWidth - 32;

        const scaleRatio = Math.min(
          availableWidth / BASE_WIDTH,
          availableHeight / BASE_HEIGHT,
          1.1
        );

        scaleWrapper.style.transform = `translate(-50%, -50%) rotate(90deg) scale(${scaleRatio})`;
        return;
      }
    } else {
      forceRotated = false;
      rotateOverlay.style.display = 'none';
      scaleWrapper.style.display = 'flex';
    }

    // Add some padding margin (e.g. 96px total width/height buffer)
    const availableWidth = window.innerWidth - 32;
    const availableHeight = window.innerHeight - 32;

    const scaleRatio = Math.min(
      availableWidth / BASE_WIDTH,
      availableHeight / BASE_HEIGHT,
      1.1 // Max scale up slightly if on massive screen
    );

    scaleWrapper.style.transform = `translate(-50%, -50%) scale(${scaleRatio})`;
  }

  window.addEventListener('resize', applyScaling);
  window.addEventListener('orientationchange', () => setTimeout(applyScaling, 100));
  applyScaling(); // Init


  // ---- Page Turn State Management ----
  function updateZIndex() {
    pages.forEach((page, index) => {
      if (page.classList.contains('turn')) {
        page.style.zIndex = 20 + index;
      } else {
        page.style.zIndex = 20 - index;
      }
    });
  }

  function turnPage(index, forward) {
    const page = pages[index];
    page.classList.remove('flipping'); // Re-enable CSS transition
    page.style.transform = ''; // Clear JS inline transform

    if (forward) {
      page.classList.add('turn');
      currentPage = index + 1;
    } else {
      page.classList.remove('turn');
      currentPage = index;
    }
    setTimeout(updateZIndex, 300); // Update z-index mid-transition
    updateDots();
  }

  // Next/Prev Clicks
  nextBtns.forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-page'));
      turnPage(idx, true);
    };
  });

  prevBtns.forEach((btn) => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-page'));
      turnPage(idx, false);
    };
  });

  // ---- Drag-to-Flip Physics Engine ----

  pages.forEach((page, index) => {
    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;
    let isAlreadyTurned = false;

    // Attach to handles inside the page
    const rightHandle = page.querySelector('.right-handle');
    const leftHandle = page.querySelector('.left-handle');

    const startDrag = (e) => {
      isDragging = true;
      isAlreadyTurned = page.classList.contains('turn');

      const isRotated = window.innerWidth <= 768 && window.innerHeight > window.innerWidth && document.getElementById('rotateOverlay').style.display === 'none';
      startX = e.type.includes('mouse')
        ? (isRotated ? e.pageY : e.pageX)
        : (isRotated ? e.touches[0].pageY : e.touches[0].pageX);

      page.classList.add('flipping'); // Remove CSS transition for 1:1 drag

      // Ensure z-index is highest while dragging
      page.style.zIndex = 50;
    };

    const doDrag = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const isRotated = window.innerWidth <= 768 && window.innerHeight > window.innerWidth && document.getElementById('rotateOverlay').style.display === 'none';
      const currentX = e.type.includes('mouse')
        ? (isRotated ? e.pageY : e.pageX)
        : (isRotated ? e.touches[0].pageY : e.touches[0].pageX);
      let deltaX = currentX - startX;

      // Convert screen delta to degrees (-180 to 0)
      // Adjust sensitivity via Math.min/max (e.g. 500px drag = 180deg)
      const sensitivity = 400;

      if (!isAlreadyTurned) {
        // Dragging left from 0deg
        if (deltaX > 0) deltaX = 0; // Prevent dragging right past 0
        currentRotation = Math.max(-180, (deltaX / sensitivity) * 180);
      } else {
        // Dragging right from -180deg
        if (deltaX < 0) deltaX = 0; // Prevent dragging left past -180
        currentRotation = Math.min(0, -180 + ((deltaX / sensitivity) * 180));
      }

      page.style.transform = `rotateY(${currentRotation}deg)`;
    };

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;

      // Determine snap threshold (e.g. -45deg or -135deg)
      if (!isAlreadyTurned) {
        // Started at 0, dragged left
        if (currentRotation < -50) {
          turnPage(index, true); // Snap forward
        } else {
          turnPage(index, false); // Snap back to 0
        }
      } else {
        // Started at -180, dragged right
        if (currentRotation > -130) {
          turnPage(index, false); // Snap back to 0
        } else {
          turnPage(index, true); // Snap forward to -180
        }
      }
    };

    if (rightHandle && leftHandle) {
      // Pointer down
      rightHandle.addEventListener('mousedown', startDrag);
      rightHandle.addEventListener('touchstart', startDrag, { passive: true });
      leftHandle.addEventListener('mousedown', startDrag);
      leftHandle.addEventListener('touchstart', startDrag, { passive: true });

      // Document level move/up to catch fast drags
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('touchmove', doDrag, { passive: false });

      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchend', endDrag);
    }
  });


  // ---- Fast Jump Actions ----

  function jumpTo(targetIdx) {
    pages.forEach((page, idx) => {
      page.classList.remove('flipping');
      page.style.transform = '';

      if (idx < targetIdx) {
        if (!page.classList.contains('turn')) {
          page.classList.add('turn');
        }
      } else {
        if (page.classList.contains('turn')) {
          page.classList.remove('turn');
        }
      }
    });
    currentPage = targetIdx;
    setTimeout(updateZIndex, 300);
    updateDots();
  }

  if (contactMeBtn) {
    contactMeBtn.onclick = (e) => {
      e.preventDefault();
      jumpTo(totalPages);
    };
  }

  if (backProfileBtn) {
    backProfileBtn.onclick = (e) => {
      e.preventDefault();
      jumpTo(0);
    };
  }


  // ---- Page Indicator Dots ----
  function updateDots() {
    pageDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
    });
  }

  pageDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = dot.getAttribute('data-goto');
      if (target === 'profile') {
        jumpTo(0);
      } else {
        jumpTo(parseInt(target) + 1);
      }
    });
  });


  // ---- Keyboard Nav ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentPage < totalPages) turnPage(currentPage, true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentPage > 0) turnPage(currentPage - 1, false);
    }
  });

  // ---- Opening Sequence ----
  function playOpeningSequence() {
    updateZIndex();

    setTimeout(() => {
      coverRight.classList.add('turn');
    }, 1500);

    setTimeout(() => {
      coverRight.style.zIndex = -1;
    }, 2100);

    setTimeout(() => {
      pageLeft.style.zIndex = 20;
    }, 2500);

    // Unfold pages
    let delay = 2500;
    for (let i = totalPages - 1; i >= 0; i--) {
      setTimeout(() => {
        pages[i].classList.remove('turn');
        setTimeout(updateZIndex, 300);
      }, delay);
      delay += 250;
    }
  }

  // Assume pages start closed in HTML
  pages.forEach(p => p.classList.add('turn'));
  playOpeningSequence();

  // ---- Typewriter ----
  const titles = [".NET Full Stack Developer", "C# Developer", "ASP.NET Core Developer", "Angular Developer"];
  let titleIndex = 0;
  let isDeleting = false;
  let charIndex = 0;

  function typeWriter() {
    const titleElement = document.querySelector('.dynamic-title');
    if (!titleElement) return;

    const currentTitle = titles[titleIndex];

    if (isDeleting) {
      titleElement.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(typeWriter, 500);
      } else {
        setTimeout(typeWriter, 40);
      }
    } else {
      titleElement.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentTitle.length) {
        isDeleting = true;
        setTimeout(typeWriter, 2000);
      } else {
        setTimeout(typeWriter, 80);
      }
    }
  }

  setTimeout(typeWriter, 3500);

})();
