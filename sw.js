const CACHE_NAME = "interview-prep-v17";
const FILES = [
  "./",
  "./index.html",
  "./bgic.html",
  "./juten.html",
  "./datadi.html",
  "./youth.html",
  "./assets/guide.css",
  "./assets/guide.js",
  "./unimicron.html",
  "./assets/unimicron-data-flow.png",
  "./assets/icons/copy.svg",
  "./assets/icons/play.svg",
  "./assets/icons/pause.svg",
  "./assets/icons/rotate-ccw.svg",
  "./self-introduction.html",
  "./system-design.html",
  "./xiangyun.html",
  "./xiangyun-technical-visual.html",
  "./upcoming-visual-drills.html",
  "./assets/visual-drills/muratec-task-journey.svg",
  "./assets/visual-drills/muratec-latency-investigation.svg",
  "./assets/visual-drills/muratec-alarm-funnel.svg",
  "./assets/visual-drills/muratec-skill-bridge.svg",
  "./assets/visual-drills/ship-product-layers.svg",
  "./assets/visual-drills/ship-validation-tunnel.svg",
  "./assets/visual-drills/ship-scale-dual-lane.svg",
  "./assets/visual-drills/ship-traceability-chain.svg",
  "./assets/visual-drills/xiangyun-rag-open-book.svg",
  "./assets/visual-drills/xiangyun-hybrid-detectives.svg",
  "./assets/visual-drills/xiangyun-trust-gates.svg",
  "./assets/visual-drills/xiangyun-workflow-agent.svg",
  "./assets/visual-drills/xiangyun-latency-relay.svg",
  "./assets/visual-drills/xiangyun-system-house.svg",
  "./assets/visual-drills/xiangyun-ai-ownership.svg",
  "./assets/visual-drills/xiangyun-demo-boundary.svg",
  "./mediatek.html",
  "./muratec.html",
  "./yuanzhao.html",
  "./ship-center.html",
  "./chuanhwa.html",
  "./mackay.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fresh = fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
      return cached || fresh;
    })
  );
});
