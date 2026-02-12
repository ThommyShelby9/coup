<template>
  <article class="feature-card glass-panel" role="article" :aria-labelledby="`feature-title-${slugifiedTitle}`">
    <div class="feature-icon-container" aria-hidden="true">
      <div class="feature-icon-glow"></div>
      <Icon :name="icon" class="feature-icon" />
    </div>

    <h3 :id="`feature-title-${slugifiedTitle}`" class="feature-title font-medieval">
      {{ title }}
    </h3>

    <p class="feature-description">
      {{ description }}
    </p>

    <div class="feature-accent" aria-hidden="true"></div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description: string
}

const props = defineProps<Props>()

// Créer un ID unique pour l'accessibilité
const slugifiedTitle = computed(() =>
  props.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
)
</script>

<style scoped>
.feature-card {
  position: relative;
  padding: 2rem;
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid rgba(251, 191, 36, 0.6);
  border-radius: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  overflow: visible;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(30, 41, 59, 0.6);
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(251, 191, 36, 0.15);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon-container {
  position: relative;
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .feature-icon-glow {
  opacity: 1;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.feature-icon {
  width: 3rem;
  height: 3rem;
  color: #fbbf24;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotateY(360deg);
}

.feature-title {
  font-size: 1.5rem;
  color: #fbbf24;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.feature-description {
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.feature-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
}

/* Animation d'entrée au scroll - Removed opacity to ensure visibility */

/* Responsive */
@media (max-width: 768px) {
  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon-container {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1rem;
  }

  .feature-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .feature-title {
    font-size: 1.25rem;
  }

  .feature-description {
    font-size: 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .feature-card::before,
  .feature-icon,
  .feature-icon-glow {
    transition: none;
    animation: none;
  }

  .feature-card {
    opacity: 1;
    transform: none;
  }

  .feature-card:hover {
    transform: none;
  }

  .feature-card:hover .feature-icon {
    transform: none;
  }
}
</style>
