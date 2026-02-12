import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Enregistrer le plugin ScrollTrigger
if (process.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export const useScrollAnimations = () => {
  let scrollTriggers: ScrollTrigger[] = []
  let activeAnimations: gsap.core.Tween[] = []

  // Détecte si l'utilisateur préfère les animations réduites
  const prefersReducedMotion = () => {
    if (process.client) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }

  // Animation fade-in simple
  const fadeIn = (
    target: gsap.TweenTarget,
    options: {
      trigger?: string | Element
      start?: string
      duration?: number
      delay?: number
    } = {}
  ) => {
    if (prefersReducedMotion()) return

    const animation = gsap.from(target, {
      opacity: 0,
      duration: options.duration || 0.8,
      delay: options.delay || 0,
      scrollTrigger: options.trigger
        ? {
            trigger: options.trigger,
            start: options.start || 'top 80%',
            toggleActions: 'play none none none'
          }
        : undefined
    })

    if (animation.scrollTrigger) {
      scrollTriggers.push(animation.scrollTrigger)
    }
  }

  // Animation slide-up avec fade
  const slideUp = (
    target: gsap.TweenTarget,
    options: {
      trigger?: string | Element
      start?: string
      duration?: number
      delay?: number
      distance?: number
    } = {}
  ) => {
    if (prefersReducedMotion()) return

    const animation = gsap.from(target, {
      opacity: 0,
      y: options.distance || 80,
      duration: options.duration || 0.8,
      delay: options.delay || 0,
      ease: 'power2.out',
      scrollTrigger: options.trigger
        ? {
            trigger: options.trigger,
            start: options.start || 'top 80%',
            toggleActions: 'play none none none'
          }
        : undefined
    })

    if (animation.scrollTrigger) {
      scrollTriggers.push(animation.scrollTrigger)
    }
  }

  // Animation slide-up avec rotation (pour cartes)
  const slideUpRotate = (
    target: gsap.TweenTarget,
    options: {
      trigger?: string | Element
      start?: string
      duration?: number
      delay?: number
      distance?: number
      rotation?: number
    } = {}
  ) => {
    if (prefersReducedMotion()) return

    const animation = gsap.from(target, {
      opacity: 0,
      y: options.distance || 100,
      rotation: options.rotation || -15,
      duration: options.duration || 0.8,
      delay: options.delay || 0,
      ease: 'back.out(1.4)',
      scrollTrigger: options.trigger
        ? {
            trigger: options.trigger,
            start: options.start || 'top 70%',
            toggleActions: 'play none none none'
          }
        : undefined
    })

    if (animation.scrollTrigger) {
      scrollTriggers.push(animation.scrollTrigger)
    }
  }

  // Animation stagger (pour listes d'éléments)
  const staggerFadeIn = (
    targets: gsap.TweenTarget,
    options: {
      trigger?: string | Element
      start?: string
      duration?: number
      stagger?: number
      distance?: number
    } = {}
  ) => {
    if (prefersReducedMotion()) return

    const animation = gsap.from(targets, {
      opacity: 0,
      y: options.distance || 60,
      duration: options.duration || 0.6,
      stagger: options.stagger || 0.15,
      ease: 'power2.out',
      scrollTrigger: options.trigger
        ? {
            trigger: options.trigger,
            start: options.start || 'top 75%',
            toggleActions: 'play none none none'
          }
        : undefined
    })

    if (animation.scrollTrigger) {
      scrollTriggers.push(animation.scrollTrigger)
    }
  }

  // Animation de compteur (count-up)
  const countUp = (
    element: HTMLElement,
    target: number,
    options: {
      duration?: number
      decimals?: number
      suffix?: string
    } = {}
  ) => {
    if (prefersReducedMotion()) {
      element.textContent = target.toString() + (options.suffix || '')
      return
    }

    const animation = gsap.to({ value: 0 }, {
      value: target,
      duration: options.duration || 2,
      ease: 'power2.out',
      onUpdate: function () {
        const currentValue = this.targets()[0].value
        const formatted = options.decimals !== undefined
          ? currentValue.toFixed(options.decimals)
          : Math.floor(currentValue).toString()
        element.textContent = formatted + (options.suffix || '')
      }
    })

    activeAnimations.push(animation)
  }

  // Animation parallax simple
  const parallax = (
    target: gsap.TweenTarget,
    options: {
      trigger?: string | Element
      start?: string
      end?: string
      speed?: number
    } = {}
  ) => {
    if (prefersReducedMotion()) return

    const speed = options.speed || 0.5
    const animation = gsap.to(target, {
      y: () => `${speed * 100}%`,
      ease: 'none',
      scrollTrigger: {
        trigger: options.trigger || target,
        start: options.start || 'top bottom',
        end: options.end || 'bottom top',
        scrub: true
      }
    })

    if (animation.scrollTrigger) {
      scrollTriggers.push(animation.scrollTrigger)
    }
  }

  // Animation d'entrée pour titre hero
  const heroTitleEntrance = (target: gsap.TweenTarget) => {
    if (prefersReducedMotion()) return

    gsap.from(target, {
      opacity: 0,
      y: 100,
      scale: 0.9,
      duration: 1.2,
      ease: 'power4.out',
      delay: 0.2
    })
  }

  // Animation de bouton avec effet de brillance
  const buttonShine = (button: HTMLElement) => {
    if (prefersReducedMotion()) return

    const shine = button.querySelector('.shine-effect')
    if (shine) {
      gsap.to(shine, {
        scaleX: 1,
        duration: 0.7,
        ease: 'power2.inOut'
      })

      gsap.to(shine, {
        scaleX: 0,
        duration: 0.7,
        delay: 0.7,
        ease: 'power2.inOut'
      })
    }
  }

  // Cleanup des ScrollTriggers et animations
  const cleanup = () => {
    // Kill toutes les animations actives
    activeAnimations.forEach(anim => anim.kill())
    activeAnimations = []

    // Kill les ScrollTriggers
    scrollTriggers.forEach(st => st.kill())
    scrollTriggers = []
  }

  // Refresh ScrollTrigger (à appeler manuellement dans onMounted du composant)
  const refresh = () => {
    if (process.client) {
      ScrollTrigger.refresh()
    }
  }

  return {
    fadeIn,
    slideUp,
    slideUpRotate,
    staggerFadeIn,
    countUp,
    parallax,
    heroTitleEntrance,
    buttonShine,
    cleanup,
    refresh,
    prefersReducedMotion
  }
}
