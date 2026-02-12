<template>
  <div ref="container" class="three-background"></div>
</template>

<script setup lang="ts">
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  PointLight,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  FogExp2,
  Light
} from 'three'
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref<HTMLElement>()

let scene: Scene
let camera: PerspectiveCamera
let renderer: WebGLRenderer
let animationId: number
let cards: Mesh[] = []
let particles: Points
let mouseX = 0
let mouseY = 0
let targetX = 0
let targetY = 0

// Couleurs des rôles
const roleColors = {
  Duke: 0x8b5cf6,      // purple
  Assassin: 0xdc2626,  // crimson
  Captain: 0x3b82f6,   // blue
  Ambassador: 0x10b981, // emerald
  Contessa: 0xfbbf24   // gold
}

const initScene = () => {
  if (!container.value) return

  // Scene
  scene = new Scene()
  scene.fog = new FogExp2(0x0f172a, 0.02)

  // Camera
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 30)

  // Renderer
  renderer = new WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  container.value.appendChild(renderer.domElement)

  // Lumières
  const ambientLight = new AmbientLight(0x404040, 0.5)
  scene.add(ambientLight)

  const pointLight1 = new PointLight(0xffd700, 2, 100)
  pointLight1.position.set(10, 10, 10)
  scene.add(pointLight1)

  const pointLight2 = new PointLight(0xffd700, 1.5, 100)
  pointLight2.position.set(-10, -10, 10)
  scene.add(pointLight2)
}

const createCards = () => {
  const roles = Object.keys(roleColors) as Array<keyof typeof roleColors>
  const radius = 15

  roles.forEach((role, index) => {
    const angle = (index / roles.length) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius

    // Géométrie de carte
    const geometry = new BoxGeometry(3, 4.2, 0.1)
    const material = new MeshPhongMaterial({
      color: roleColors[role],
      shininess: 100,
      emissive: roleColors[role],
      emissiveIntensity: 0.2
    })

    const card = new Mesh(geometry, material)
    card.position.set(x, Math.random() * 4 - 2, z)
    card.rotation.y = -angle + Math.PI / 2

    // Propriétés personnalisées pour l'animation
    ;(card as any).floatSpeed = 0.5 + Math.random() * 0.5
    ;(card as any).floatOffset = Math.random() * Math.PI * 2
    ;(card as any).rotationSpeed = (Math.random() - 0.5) * 0.01

    scene.add(card)
    cards.push(card)

    // Bordure dorée
    const edgesGeometry = new EdgesGeometry(geometry)
    const edgesMaterial = new LineBasicMaterial({ color: 0xffd700 })
    const edges = new LineSegments(edgesGeometry, edgesMaterial)
    card.add(edges)
  })
}

const createParticles = () => {
  const particlesGeometry = new BufferGeometry()
  const particlesCount = 150
  const positions = new Float32Array(particlesCount * 3)

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100
  }

  particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3))

  const particlesMaterial = new PointsMaterial({
    color: 0xffd700,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: 2 // AdditiveBlending
  })

  particles = new Points(particlesGeometry, particlesMaterial)
  scene.add(particles)
}

const handleMouseMove = (event: MouseEvent) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1
}

const handleResize = () => {
  if (!renderer || !camera) return

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const time = Date.now() * 0.001

  // Animation des cartes
  cards.forEach((card) => {
    const floatSpeed = (card as any).floatSpeed
    const floatOffset = (card as any).floatOffset
    const rotationSpeed = (card as any).rotationSpeed

    // Mouvement de flottement
    card.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.01

    // Rotation douce
    card.rotation.y += rotationSpeed
    card.rotation.x = Math.sin(time * 0.5 + floatOffset) * 0.1
  })

  // Animation des particules
  if (particles) {
    particles.rotation.y += 0.0005
    particles.rotation.x = Math.sin(time * 0.3) * 0.1
  }

  // Camera suit la souris (parallax)
  targetX = mouseX * 2
  targetY = mouseY * 2

  camera.position.x += (targetX - camera.position.x) * 0.05
  camera.position.y += (targetY - camera.position.y) * 0.05
  camera.lookAt(scene.position)

  renderer.render(scene, camera)
}

const cleanup = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  // Nettoyer les cartes ET leurs edges enfants
  cards.forEach((card) => {
    // Dispose des edges enfants
    card.children.forEach(child => {
      if (child instanceof LineSegments) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })

    // Dispose de la carte elle-même
    card.geometry.dispose()
    if (Array.isArray(card.material)) {
      card.material.forEach(m => m.dispose())
    } else {
      card.material.dispose()
    }
  })
  cards = [] // Vider l'array

  // Nettoyer les particules
  if (particles) {
    particles.geometry.dispose()
    if (Array.isArray(particles.material)) {
      particles.material.forEach(m => m.dispose())
    } else {
      particles.material.dispose()
    }
  }

  // Dispose des lights
  scene.children.forEach(child => {
    if (child instanceof Light) {
      child.dispose()
    }
  })

  // Nettoyer le renderer
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement) {
      container.value.removeChild(renderer.domElement)
    }
  }

  // Retirer les event listeners
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', handleResize)
}

onMounted(() => {
  // Désactiver sur mobile pour les performances
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )

  if (isMobile) {
    return // Ne pas initialiser Three.js sur mobile
  }

  initScene()
  createCards()
  createParticles()
  animate()

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.three-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.three-background canvas {
  display: block;
}
</style>
