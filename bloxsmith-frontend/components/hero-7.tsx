"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import { ArrowRight, Github } from "lucide-react";
import Image from "next/image";
import LiquidLines from "@/components/liquid-lines";


const carouselVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const carouselFragmentShader = `
  uniform sampler2D uTextureBefore;
  uniform sampler2D uTextureAfter;
  uniform float uBarWidth;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float roundedRectSDF(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  void main() {
    vec4 beforeColor = texture2D(uTextureBefore, vUv);
    vec4 afterColor = texture2D(uTextureAfter, vUv);

    float barTransition = smoothstep(-uBarWidth, uBarWidth, vWorldPosition.x);

    vec3 finalColor = mix(beforeColor.rgb, afterColor.rgb, barTransition);
    float finalAlpha = mix(beforeColor.a, afterColor.a, barTransition);

    vec2 centeredUv = vUv * 2.0 - 1.0;
    float cornerRadius = 0.1;
    float dist = roundedRectSDF(centeredUv, vec2(1.0, 1.0), cornerRadius);
    float alpha = 1.0 - smoothstep(-0.02, 0.02, dist);

    gl_FragColor = vec4(finalColor, alpha * finalAlpha);
  }
`;

const glowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float centerDist = abs(vUv.x - 0.5) * 2.0;

    float coreGlow = exp(-centerDist * 60.0) * 2.5;
    float midGlow = exp(-centerDist * 12.0) * 1.2;
    float outerGlow = exp(-centerDist * 4.0) * 0.5;
    float glow = coreGlow + midGlow + outerGlow;

    float pulse = sin(uTime * 1.5) * 0.08 + 0.92;
    glow *= pulse;

    float scanLine = sin(vUv.y * 60.0 + uTime * 2.0) * 0.02 + 0.98;
    glow *= scanLine;

    vec3 glowColor = vec3(1.0, 1.0, 1.0);

    float edgeDist = abs(vUv.y - 0.5) * 2.0;
    float vertFade = 1.0 - smoothstep(0.2, 0.95, edgeDist);
    glow *= vertFade;

    gl_FragColor = vec4(glowColor * glow, glow);
  }
`;

const CAROUSEL_PAIRS = [
  { before: "/hero/unstyled-shop.png", after: "/hero/styled-shop.png" },
  { before: "/hero/unstyled-settings.png", after: "/hero/styled-settings.png" },
  { before: "/hero/unstyled-leaderboard.png", after: "/hero/styled-leaderboard.png" },
  { before: "/hero/unstyled-inventory.png", after: "/hero/styled-inventory.png" },
  { before: "/hero/unstyled-notifications.png", after: "/hero/styled-notifications.png" },
  { before: "/hero/unstyled-profile.png", after: "/hero/styled-profile.png" },
  { before: "/hero/unstyled-daily-rewards.png", after: "/hero/styled-daily-rewards.png" },
];

interface CarouselItemProps {
  beforeTexture: THREE.Texture;
  afterTexture: THREE.Texture;
  index: number;
  totalItems: number;
  rotationRef: React.RefObject<number>;
  radius: number;
}

function CarouselItem({
  beforeTexture,
  afterTexture,
  index,
  totalItems,
  rotationRef,
  radius,
}: CarouselItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTextureBefore: { value: beforeTexture },
      uTextureAfter: { value: afterTexture },
      uBarWidth: { value: 0.1 },
    }),
    [beforeTexture, afterTexture],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    const anglePerItem = (Math.PI * 2) / totalItems;
    const baseAngle = index * anglePerItem;
    const currentAngle = baseAngle + rotationRef.current;

    const normalizedAngle =
      (((currentAngle % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) -
      Math.PI;

    const x = Math.sin(normalizedAngle) * radius;
    const z = -Math.cos(normalizedAngle) * radius + radius * 0.1;

    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y = -normalizedAngle;

    const isBehind = Math.abs(normalizedAngle) > Math.PI * 0.7;
    meshRef.current.visible = !isBehind;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.0, 2.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={carouselVertexShader}
        fragmentShader={carouselFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlowParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 80;
  const fadeDistance = 0.4;

  const velocitiesRef = useRef<Float32Array>(
    new Float32Array(particleCount * 3),
  );
  const lifetimesRef = useRef<Float32Array>(new Float32Array(particleCount));

  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const y = (i / particleCount - 0.5) * 1.2;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = (((i * 0.618) % 1.0) - 0.5) * 0.1;
    }

    return positions;
  }, [particleCount]);

  useEffect(() => {
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;

    for (let i = 0; i < particleCount; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      velocities[i * 3] = direction * (((i * 0.382) % 1.0) * 0.012 + 0.004);
      velocities[i * 3 + 1] = (((i * 0.786) % 1.0) - 0.4) * 0.006;
      velocities[i * 3 + 2] = (((i * 0.214) % 1.0) - 0.5) * 0.003;

      lifetimes[i] = (i * 0.123) % 1.0;
    }
  }, [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const opacities = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      opacities[i] = 1.0;
    }
    geo.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    return geo;
  }, [positions]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#FFFFFF") },
        uFadeDistance: { value: fadeDistance },
      },
      vertexShader: `
        attribute float aOpacity;
        varying float vOpacity;
        varying float vDistance;

        void main() {
          vOpacity = aOpacity;
          vDistance = abs(position.x);

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 20.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uFadeDistance;
        varying float vOpacity;
        varying float vDistance;

        void main() {
          float fade = 1.0 - smoothstep(0.0, uFadeDistance, vDistance);

          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

          gl_FragColor = vec4(uColor, alpha * fade * vOpacity * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [fadeDistance]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const positionAttr = particlesRef.current.geometry.attributes.position;
    const opacityAttr = particlesRef.current.geometry.attributes.aOpacity;
    const posArray = positionAttr.array as Float32Array;
    const opacityArray = opacityAttr.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;

    for (let i = 0; i < particleCount; i++) {
      const currentLifetime = lifetimes[i] + 0.012;
      const newLifetime = currentLifetime > 1 ? 0 : currentLifetime;
      lifetimes[i] = newLifetime;

      if (currentLifetime > 1) {
        posArray[i * 3] = 0;
        posArray[i * 3 + 1] =
          (((i + state.clock.elapsedTime * 10) % particleCount) /
            particleCount -
            0.5) *
          1.2;
        posArray[i * 3 + 2] =
          (((i * 0.618 + state.clock.elapsedTime) % 1.0) - 0.5) * 0.1;

        const direction = i % 2 === 0 ? 1 : -1;
        velocities[i * 3] =
          direction *
          ((((i + state.clock.elapsedTime) * 0.382) % 1.0) * 0.012 + 0.004);
        velocities[i * 3 + 1] =
          ((((i + state.clock.elapsedTime) * 0.786) % 1.0) - 0.4) * 0.006;
      }

      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] +=
        velocities[i * 3 + 1] +
        Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.0008;
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      const dist = Math.abs(posArray[i * 3]);
      opacityArray[i] = Math.max(0, 1.0 - dist / fadeDistance);
    }

    positionAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} geometry={geometry} material={shaderMaterial} />
  );
}

function GlowBar() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[0, 0, 2]}>
      <mesh>
        <planeGeometry args={[0.7, 2.0]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <GlowParticles />
    </group>
  );
}

function ResizeHandler() {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const { gl, camera } = useThree();

  useEffect(() => {
    glRef.current = gl;
    cameraRef.current = camera;
  }, [gl, camera]);

  useEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const currentGl = glRef.current;
      const currentCamera = cameraRef.current;
      if (!currentGl || !currentCamera) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width > 0 && height > 0) {
        currentGl.setSize(width, height);
        if (currentCamera instanceof THREE.PerspectiveCamera) {
          currentCamera.aspect = width / height;
          currentCamera.updateProjectionMatrix();
        }
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(parent);

    const interval = setInterval(updateSize, 500);
    setTimeout(updateSize, 100);
    setTimeout(updateSize, 300);
    setTimeout(updateSize, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [gl]);

  return null;
}

function CarouselScene() {
  const beforePaths = CAROUSEL_PAIRS.map((p) => p.before);
  const afterPaths = CAROUSEL_PAIRS.map((p) => p.after);
  const beforeTextures = useTexture(beforePaths);
  const afterTextures = useTexture(afterPaths);
  const rotationRef = useRef(0);
  const radius = 4.5;

  useFrame((state) => {
    rotationRef.current = state.clock.elapsedTime * 0.15;
  });

  return (
    <group>
      {CAROUSEL_PAIRS.map((_, index) => (
        <CarouselItem
          key={index}
          beforeTexture={beforeTextures[index]}
          afterTexture={afterTextures[index]}
          index={index}
          totalItems={CAROUSEL_PAIRS.length}
          rotationRef={rotationRef}
          radius={radius}
        />
      ))}
      <GlowBar />
    </group>
  );
}

function Scene() {
  return (
    <group scale={1}>
      <CarouselScene />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

export function Hero7() {
  return (
    <section className="relative w-full min-h-screen bg-background overflow-hidden">
      <div className="absolute inset-0 z-0">
        <LiquidLines
          speed={0.3}
          iterations={3}
          lineColor="#ffffff"
          lightBackground="#1a1a1a"
          darkBackground="#1a1a1a"
          brightness={1.5}
          opacity={0.4}
          scale={0.3}
        />
      </div>
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(0 0% 10%) 0%, hsl(0 0% 10% / 0.95) 40%, hsl(0 0% 10% / 0.7) 65%, transparent 100%)", height: "600px" }} />
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-start sm:items-center text-left sm:text-center pt-10 sm:pt-12 md:pt-14 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-0"
        >
          <img
            src="/logos/bloxsmith-wordmark.svg"
            alt="Bloxsmith"
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
        </motion.div>

        <motion.a
          href="https://github.com/boshyxd/robloxstudio-mcp"
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-4 sm:mt-5 mb-5 sm:mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-none border border-foreground/30 bg-foreground/10 text-xs sm:text-sm text-foreground/80 font-medium hover:bg-foreground/20 transition-colors cursor-pointer"
        >
          <Github className="w-3.5 h-3.5" />
          From the makers of robloxstudio-mcp
          <span className="text-foreground/40">|</span>
          <span className="font-bold">10K+ installs</span>
        </motion.a>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-medium text-foreground tracking-tight leading-[1.1] max-w-4xl"
        >
          The AI Forge for
          <br />
          <span className="inline-flex items-baseline gap-2 sm:gap-3">
            <Image
              src="/logos/roblox.svg"
              alt="Roblox"
              width={240}
              height={44}
              className="inline h-[0.75em] w-auto translate-y-[0.03em] invert"
            />
            Developers
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed"
        >
          Generate <span className="text-foreground font-medium">production-ready</span> Roblox UIs
          with <span className="text-foreground font-medium">curated styles</span>.
          <br className="hidden sm:block" />
          Pay only for what you use. Simple per-generation pricing.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
        >
          <motion.a
            href="/forge/ui"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-foreground hover:bg-foreground/90 text-background rounded-none text-sm sm:text-base font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            Start Building Free
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-secondary hover:bg-accent border border-border rounded-none text-foreground text-sm sm:text-base font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            See How It Works
          </motion.a>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-10 translate-y-[140px] sm:translate-y-[180px] xl:translate-y-[160px]">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={[1, 2]}
          frameloop="always"
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
        >
          <ResizeHandler />
          <Suspense fallback={<LoadingFallback />}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
