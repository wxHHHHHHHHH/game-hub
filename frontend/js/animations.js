/* ============================================
   波比 — GSAP Animations
   ============================================ */

(function(){
'use strict';

// Wait for GSAP to load
function initGSAP(cb) {
  if (window.gsap && window.ScrollTrigger) { cb(); return; }
  var t = setInterval(function() {
    if (window.gsap && window.ScrollTrigger) { clearInterval(t); cb(); }
  }, 100);
}

initGSAP(function() {
  gsap.registerPlugin(ScrollTrigger);

  // ========== GLOBAL OBSERVER ==========
  // Watch DOM for new elements to animate
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches('.video-card')) animateCard(node);
        if (node.matches && node.matches('.news-card')) animateNewsCard(node);
        if (node.matches && node.matches('.timeline-item')) animateGalleryItem(node);
        if (node.matches && node.matches('.comment-item')) animateComment(node);
        if (node.matches && node.matches('.file-item')) animateFileItem(node);
        // Find child elements
        if (node.querySelectorAll) {
          node.querySelectorAll('.video-card').forEach(animateCard);
          node.querySelectorAll('.news-card').forEach(animateNewsCard);
          node.querySelectorAll('.timeline-item').forEach(animateGalleryItem);
          node.querySelectorAll('.comment-item').forEach(animateComment);
        }
      });
    });
  });

  // ========== ANIMATION FUNCTIONS ==========

  function animateCard(el) {
    gsap.fromTo(el, { opacity:0, y:30 }, {
      opacity:1, y:0, duration:0.6, ease:'power3.out',
      scrollTrigger: { trigger:el, start:'top bottom-=60px', toggleActions:'play none none none' }
    });
  }

  function animateNewsCard(el) {
    gsap.fromTo(el, { opacity:0, x:-20 }, {
      opacity:1, x:0, duration:0.5, ease:'power2.out',
      scrollTrigger: { trigger:el, start:'top bottom-=40px', toggleActions:'play none none none' }
    });
  }

  function animateGalleryItem(el) {
    gsap.fromTo(el, { opacity:0, scale:0.9, y:20 }, {
      opacity:1, scale:1, y:0, duration:0.6, ease:'power3.out',
      scrollTrigger: { trigger:el, start:'top bottom-=40px', toggleActions:'play none none none' }
    });
  }

  function animateComment(el) {
    gsap.fromTo(el, { opacity:0, x:20 }, {
      opacity:1, x:0, duration:0.4, ease:'power2.out',
      scrollTrigger: { trigger:el, start:'top bottom-=20px', toggleActions:'play none none none' }
    });
  }

  function animateFileItem(el) {
    gsap.fromTo(el, { opacity:0, y:10 }, {
      opacity:1, y:0, duration:0.3, ease:'power2.out',
      scrollTrigger: { trigger:el, start:'top bottom-=20px', toggleActions:'play none none none' }
    });
  }

  // ========== OBSERVE ==========
  observer.observe(document.body, { childList:true, subtree:true });

  // ========== RENDER-TRIGGERED BATCH ANIMATION ==========
  window.GSANIM = {
    // Called after renderVideoList
    videoGrid: function() {
      gsap.utils.toArray('.video-grid .video-card').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, y:40 }, {
          opacity:1, y:0, duration:0.5, delay:i*0.08, ease:'power3.out',
          scrollTrigger: { trigger:el, start:'top bottom-=50px', toggleActions:'play none none none' }
        });
      });
    },

    // Called after renderNewsList
    newsList: function() {
      gsap.utils.toArray('.news-card').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, x:-30 }, {
          opacity:1, x:0, duration:0.4, delay:i*0.06, ease:'power2.out',
          scrollTrigger: { trigger:el, start:'top bottom-=40px', toggleActions:'play none none none' }
        });
      });
    },

    // Called after renderGallery
    gallery: function() {
      gsap.utils.toArray('.timeline-item').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, scale:0.85, y:30 }, {
          opacity:1, scale:1, y:0, duration:0.5, delay:i*0.05, ease:'power3.out',
          scrollTrigger: { trigger:el, start:'top bottom-=40px', toggleActions:'play none none none' }
        });
      });
    },

    // Comments stagger
    comments: function() {
      gsap.utils.toArray('.comment-item').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, x:20 }, {
          opacity:1, x:0, duration:0.35, delay:i*0.05, ease:'power2.out',
          scrollTrigger: { trigger:el, start:'top bottom-=30px', toggleActions:'play none none none' }
        });
      });
    },

    // Page hero entrance
    hero: function() {
      gsap.fromTo('.hero', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.8, ease:'power3.out' });
    },

    // Modal open
    modalIn: function(el) {
      gsap.fromTo(el || '.modal', { opacity:0, scale:0.9, y:20 }, { opacity:1, scale:1, y:0, duration:0.35, ease:'back.out(1.4)' });
    },

    // Like heart burst
    likeBurst: function(el) {
      gsap.fromTo(el, { scale:1 }, { scale:1.4, duration:0.2, ease:'power2.out', yoyo:true, repeat:1 });
    },

    // Toast slide
    toastIn: function(el) {
      gsap.fromTo(el, { opacity:0, y:20 }, { opacity:1, y:0, duration:0.3, ease:'power2.out' });
    },

    // Number count-up
    countUp: function(el, target) {
      var obj = { val: 0 };
      gsap.to(obj, { val:target, duration:1.5, ease:'power2.out', onUpdate:function(){ el.textContent = Math.round(obj.val); } });
    },

    // File items
    files: function() {
      gsap.utils.toArray('.file-item').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, y:15 }, {
          opacity:1, y:0, duration:0.3, delay:i*0.05, ease:'power2.out',
          scrollTrigger: { trigger:el, start:'top bottom-=20px', toggleActions:'play none none none' }
        });
      });
    },

    // Stats cards
    stats: function() {
      gsap.utils.toArray('.stat-card').forEach(function(el, i) {
        gsap.fromTo(el, { opacity:0, y:20 }, {
          opacity:1, y:0, duration:0.4, delay:i*0.08, ease:'power2.out',
          scrollTrigger: { trigger:el, start:'top bottom-=30px', toggleActions:'play none none none' }
        });
      });
    }
  };

  // ========== SCROLL-TRIGGER HEADER SHADOW ==========
  // Only adjust blur + shadow on scroll; background already follows theme via CSS
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onEnter: function() {
      gsap.to('.header', { backdropFilter:'blur(16px)', duration:0.3, boxShadow:'0 2px 20px rgba(0,0,0,0.08)' });
    },
    onLeaveBack: function() {
      gsap.to('.header', { backdropFilter:'blur(8px)', duration:0.3, boxShadow:'0 1px 8px rgba(0,0,0,0.06)' });
    }
  });

  // ========== CAROUSEL SMOOTH ==========
  window.GSANIM.carouselSlide = function(track, index) {
    gsap.to(track, { x: -(index * 100) + '%', duration:0.6, ease:'power3.inOut' });
  };

  console.log('🎬 GSAP animations initialized');
});

})();
