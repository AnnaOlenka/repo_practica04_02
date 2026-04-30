(() => {
  "use strict";

  const canvas = document.querySelector("#spaceCanvas");
  const ctx = canvas.getContext("2d");
  const controlPanel = document.querySelector(".control-panel");
  const speedRange = document.querySelector("#speedRange");
  const speedValue = document.querySelector("#speedValue");
  const speedError = document.querySelector("#speedError");
  const starDensityRange = document.querySelector("#starDensityRange");
  const starDensityValue = document.querySelector("#starDensityValue");
  const toggleMotion = document.querySelector("#toggleMotion");
  const toggleTrails = document.querySelector("#toggleTrails");
  const fpsCounter = document.querySelector("#fpsCounter");
  const planetCounter = document.querySelector("#planetCounter");
  const starCounter = document.querySelector("#starCounter");
  const planetList = document.querySelector("#planetList");

  const planets = [
    { name: "Mercurio", radius: 4, orbit: 52, speed: 1.75, color: "#d0c2a6", angle: 0.2 },
    { name: "Venus", radius: 7, orbit: 82, speed: 1.25, color: "#f0b66c", angle: 1.4 },
    { name: "Tierra", radius: 8, orbit: 118, speed: 1, color: "#4fa8ff", angle: 2.7 },
    { name: "Marte", radius: 6, orbit: 154, speed: 0.82, color: "#e6674f", angle: 4.3 },
    { name: "Jupiter", radius: 15, orbit: 210, speed: 0.44, color: "#d9a26f", angle: 5.1 },
    { name: "Saturno", radius: 13, orbit: 272, speed: 0.32, color: "#e0c778", angle: 3.2 },
    { name: "Urano", radius: 10, orbit: 330, speed: 0.23, color: "#8de8e2", angle: 0.9 },
    { name: "Neptuno", radius: 10, orbit: 388, speed: 0.18, color: "#6787ff", angle: 2.1 }
  ];

  const createAnimationStore = () => {
    let rafId = 0;
    let lastTime = 0;
    let fpsFrames = 0;
    let fpsElapsed = 0;
    let stars = [];
    let state = {
      width: 0,
      height: 0,
      dpr: 1,
      speed: 1,
      starDensity: 1,
      paused: false,
      showTrails: true
    };

    /*
      Closure: las variables rafId, lastTime, fpsFrames, fpsElapsed, stars y state
      viven en el scope de createAnimationStore. Los metodos retornados las retienen
      entre frames sin exponerlas como variables globales. Cada requestAnimationFrame
      vuelve a ejecutar render(), pero el estado anterior sigue disponible aqui.
    */
    return {
      getState: () => state,
      getStars: () => stars,
      setSpeed: value => {
        state = { ...state, speed: value };
      },
      setStarDensity: value => {
        state = { ...state, starDensity: value };
        stars = createStars(getStarCount(state.width, state.height, state.starDensity), state.width, state.height);
        starCounter.textContent = String(stars.length);
      },
      togglePaused: () => {
        state = { ...state, paused: !state.paused };
        return state.paused;
      },
      toggleTrails: () => {
        state = { ...state, showTrails: !state.showTrails };
        return state.showTrails;
      },
      resize: () => {
        const rect = canvas.getBoundingClientRect();
        state = {
          ...state,
          width: rect.width,
          height: rect.height,
          dpr: Math.min(window.devicePixelRatio || 1, 2)
        };
        canvas.width = Math.floor(rect.width * state.dpr);
        canvas.height = Math.floor(rect.height * state.dpr);
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
        stars = createStars(getStarCount(rect.width, rect.height, state.starDensity), rect.width, rect.height);
        starCounter.textContent = String(stars.length);
      },
      start: renderLoop => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        lastTime = performance.now();
        rafId = requestAnimationFrame(time => renderLoop(time));
      },
      nextFrame: (renderLoop, time) => {
        const dt = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        fpsFrames += 1;
        fpsElapsed += dt;

        if (fpsElapsed >= 0.5) {
          fpsCounter.textContent = String(Math.round(fpsFrames / fpsElapsed));
          fpsFrames = 0;
          fpsElapsed = 0;
        }

        rafId = requestAnimationFrame(nextTime => renderLoop(nextTime, time));
        return dt;
      },
      stop: () => {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  };

  const store = createAnimationStore();

  const getStarCount = (width, height, density) => Math.round((width * height * density) / 5200);

  const createStars = (count, width, height) => Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.8 + 0.35,
    alpha: Math.random() * 0.7 + 0.25,
    pulse: Math.random() * Math.PI * 2,
    drift: Math.random() * 10 + 2
  }));

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getCenter = () => {
    const { width, height } = store.getState();
    return {
      x: width * (width < 760 ? 0.5 : 0.42),
      y: height * 0.52
    };
  };

  const drawStars = dt => {
    const { width, height } = store.getState();
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, width, height);

    store.getStars().forEach(star => {
      star.pulse += dt * 2;
      star.y += dt * star.drift;

      if (star.y > height + 4) {
        star.y = -4;
        star.x = Math.random() * width;
      }

      const alpha = clamp(star.alpha + Math.sin(star.pulse) * 0.22, 0.12, 1);
      ctx.fillStyle = `rgba(244, 247, 255, ${alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });
  };

  const drawSun = center => {
    const glow = ctx.createRadialGradient(center.x, center.y, 8, center.x, center.y, 72);
    glow.addColorStop(0, "rgba(255, 226, 126, 1)");
    glow.addColorStop(0.38, "rgba(244, 151, 74, 0.72)");
    glow.addColorStop(1, "rgba(244, 151, 74, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd36f";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 24, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlanet = (planet, center) => {
    const x = center.x + Math.cos(planet.angle) * planet.orbit;
    const y = center.y + Math.sin(planet.angle) * planet.orbit * 0.58;

    ctx.fillStyle = planet.color;
    ctx.beginPath();
    ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
    ctx.fill();

    if (planet.name === "Saturno") {
      ctx.strokeStyle = "rgba(240, 215, 143, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, planet.radius + 9, planet.radius * 0.42, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawOrbits = center => {
    ctx.strokeStyle = "rgba(244, 247, 255, 0.16)";
    ctx.lineWidth = 1;
    planets.forEach(planet => {
      ctx.beginPath();
      ctx.ellipse(center.x, center.y, planet.orbit, planet.orbit * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const updatePlanets = dt => {
    const { speed, paused } = store.getState();
    if (paused) {
      return;
    }

    planets.forEach(planet => {
      planet.angle += dt * planet.speed * speed;
    });
  };

  const render = time => {
    const dt = store.nextFrame(render, time);
    const center = getCenter();
    const { showTrails } = store.getState();

    drawStars(dt);
    if (showTrails) {
      drawOrbits(center);
    }
    drawSun(center);
    updatePlanets(dt);
    planets.forEach(planet => drawPlanet(planet, center));
  };

  const validateSpeed = value => {
    const numericValue = Number(value);
    const isValid = Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 5;
    speedError.textContent = isValid ? "" : "Usa un valor entre 0 y 5.";
    speedRange.classList.toggle("has-error", !isValid);
    return isValid ? numericValue : store.getState().speed;
  };

  const renderPlanetList = () => {
    const fragment = document.createDocumentFragment();

    planets.forEach(planet => {
      const item = document.createElement("li");
      const swatch = document.createElement("span");
      const name = document.createElement("span");
      const speed = document.createElement("span");

      item.className = "planet-item";
      swatch.className = "planet-swatch";
      name.className = "planet-name";
      speed.className = "planet-speed";

      swatch.style.setProperty("--planet-color", planet.color);
      name.textContent = planet.name;
      speed.textContent = `${planet.speed.toFixed(2)} rad/s`;

      item.append(swatch, name, speed);
      fragment.append(item);
    });

    planetList.replaceChildren(fragment);
    planetCounter.textContent = String(planets.length);
  };

  const updateSpeedUI = value => {
    speedValue.textContent = `${value.toFixed(1)}x`;
    document.documentElement.style.setProperty("--speed-hue", String(174 - value * 20));
  };

  const updateStarDensityUI = value => {
    starDensityValue.textContent = `${value.toFixed(1)}x`;
  };

  const bindEvents = () => {
    controlPanel.addEventListener("input", event => {
      if (event.target === speedRange) {
        const nextSpeed = validateSpeed(speedRange.value);
        store.setSpeed(nextSpeed);
        updateSpeedUI(nextSpeed);
      }

      if (event.target === starDensityRange) {
        const density = Number(starDensityRange.value);
        store.setStarDensity(density);
        updateStarDensityUI(density);
      }
    });

    controlPanel.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) {
        return;
      }

      // Event bubbling: un solo listener en el panel atiende clicks de botones hijos.
      if (button === toggleMotion) {
        const isPaused = store.togglePaused();
        document.body.classList.toggle("is-paused", isPaused);
        toggleMotion.classList.toggle("is-active", isPaused);
        toggleMotion.setAttribute("aria-pressed", String(isPaused));
        toggleMotion.querySelector("span:last-child").textContent = isPaused ? "Reanudar" : "Pausar";
        toggleMotion.querySelector(".button-icon").textContent = isPaused ? ">" : "II";
      }

      if (button === toggleTrails) {
        const showing = store.toggleTrails();
        toggleTrails.classList.toggle("is-active", showing);
        toggleTrails.setAttribute("aria-pressed", String(showing));
      }
    });

    window.addEventListener("resize", store.resize, { passive: true });
    window.addEventListener("pagehide", store.stop, { once: true });
  };

  (() => {
    renderPlanetList();
    bindEvents();
    store.resize();
    updateSpeedUI(store.getState().speed);
    updateStarDensityUI(store.getState().starDensity);
    store.start(render);
  })();
})();
