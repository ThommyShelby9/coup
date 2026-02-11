import { gsap } from 'gsap'

export const useGameAnimations = () => {
  /**
   * Anime la distribution des cartes aux joueurs
   */
  const animateCardDeal = (cardElements: HTMLElement[], playerPositions: { x: number; y: number }[]) => {
    cardElements.forEach((card, index) => {
      const targetPos = playerPositions[index]

      gsap.fromTo(card, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 0,
        opacity: 0
      }, {
        x: targetPos.x,
        y: targetPos.y,
        rotation: Math.random() * 20 - 10,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)"
      })
    })
  }

  /**
   * Anime le transfert de pièces entre joueurs
   */
  const animateCoinTransfer = (
    fromElement: HTMLElement,
    toElement: HTMLElement,
    amount: number,
    onComplete?: () => void
  ) => {
    const fromRect = fromElement.getBoundingClientRect()
    const toRect = toElement.getBoundingClientRect()

    for (let i = 0; i < amount; i++) {
      const coin = document.createElement('div')
      coin.innerHTML = '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" stroke-width="2" fill="url(#goldGradient)"/><defs><linearGradient id="goldGradient"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs></svg>'
      coin.className = 'fixed z-50 pointer-events-none text-gold-400'
      coin.style.left = `${fromRect.left + fromRect.width / 2}px`
      coin.style.top = `${fromRect.top + fromRect.height / 2}px`
      coin.style.filter = 'drop-shadow(0 4px 12px rgba(251, 191, 36, 0.8))'
      document.body.appendChild(coin)

      // Animation arc parabolique
      const timeline = gsap.timeline({
        onComplete: () => {
          coin.remove()
          if (i === amount - 1 && onComplete) {
            onComplete()
          }
        }
      })

      const midX = (toRect.left - fromRect.left) / 2 + (Math.random() - 0.5) * 50
      const midY = (toRect.top - fromRect.top) / 2 - 100 + (Math.random() - 0.5) * 50

      timeline
        .to(coin, {
          x: midX,
          y: midY,
          scale: 1.5,
          rotation: 180,
          duration: 0.5,
          delay: i * 0.08,
          ease: "power2.out"
        })
        .to(coin, {
          x: toRect.left - fromRect.left + (Math.random() * 20 - 10),
          y: toRect.top - fromRect.top + (Math.random() * 20 - 10),
          scale: 0.5,
          rotation: 360,
          duration: 0.5,
          ease: "power2.in"
        })
    }
  }

  /**
   * Anime un bluff réussi (effet de succès)
   */
  const animateBluffSuccess = (playerElement: HTMLElement) => {
    const timeline = gsap.timeline()

    timeline
      .to(playerElement, {
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.8)',
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(playerElement, {
        boxShadow: '0 0 0px rgba(16, 185, 129, 0)',
        scale: 1,
        duration: 0.5,
        ease: "power2.in"
      })

    // Particules de succès
    createSuccessParticles(playerElement)
  }

  /**
   * Anime un bluff échoué (effet de tremblement)
   */
  const animateBluffFailed = (playerElement: HTMLElement) => {
    gsap.to(playerElement, {
      x: [-10, 10, -10, 10, 0],
      duration: 0.5,
      ease: "power2.inOut"
    })

    gsap.to(playerElement, {
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
      duration: 0.3,
      yoyo: true,
      repeat: 3
    })
  }

  /**
   * Anime le retournement d'une carte
   */
  const animateCardFlip = (cardElement: HTMLElement, onComplete?: () => void) => {
    gsap.to(cardElement, {
      rotateY: 180,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete
    })
  }

  /**
   * Anime l'élimination d'une carte (disparition)
   */
  const animateCardElimination = (cardElement: HTMLElement, onComplete?: () => void) => {
    const timeline = gsap.timeline()

    timeline
      .to(cardElement, {
        scale: 1.1,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(cardElement, {
        scale: 0,
        rotation: 360,
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1.7)",
        onComplete
      })
  }

  /**
   * Anime une action agressive (attaque, assassinat)
   */
  const animateAttack = (attackerElement: HTMLElement, targetElement: HTMLElement) => {
    const attackerRect = attackerElement.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()

    // Créer un projectile visuel
    const projectile = document.createElement('div')
    projectile.className = 'fixed w-4 h-4 bg-red-500 rounded-full z-50 pointer-events-none'
    projectile.style.left = `${attackerRect.left + attackerRect.width / 2}px`
    projectile.style.top = `${attackerRect.top + attackerRect.height / 2}px`
    document.body.appendChild(projectile)

    // Animation de l'attaquant
    gsap.to(attackerElement, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    })

    // Animation du projectile
    gsap.to(projectile, {
      x: targetRect.left - attackerRect.left,
      y: targetRect.top - attackerRect.top,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        projectile.remove()
        // Shake de la cible
        gsap.to(targetElement, {
          x: [-5, 5, -5, 5, 0],
          duration: 0.3,
          ease: "power2.inOut"
        })
      }
    })
  }

  /**
   * Anime l'apparition d'un modal
   */
  const animateModalShow = (modalElement: HTMLElement) => {
    gsap.fromTo(modalElement, {
      scale: 0.8,
      opacity: 0,
      y: 50
    }, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "back.out(1.7)"
    })
  }

  /**
   * Anime la disparition d'un modal
   */
  const animateModalHide = (modalElement: HTMLElement, onComplete?: () => void) => {
    gsap.to(modalElement, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
      onComplete
    })
  }

  /**
   * Anime le passage au tour suivant (highlight du joueur actif)
   */
  const animateTurnChange = (newActivePlayerElement: HTMLElement) => {
    const timeline = gsap.timeline()

    timeline
      .to(newActivePlayerElement, {
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.8)',
        scale: 1.05,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(newActivePlayerElement, {
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
        scale: 1,
        duration: 0.5,
        ease: "power2.in"
      })
  }

  /**
   * Anime la victoire (confettis et effet dramatique)
   */
  const animateVictory = (winnerElement: HTMLElement) => {
    const timeline = gsap.timeline()

    timeline
      .to(winnerElement, {
        scale: 1.2,
        rotation: 5,
        duration: 0.5,
        ease: "back.out(1.7)"
      })
      .to(winnerElement, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.inOut"
      })

    // Créer des confettis
    createVictoryConfetti()
  }

  /**
   * Crée des particules de succès autour d'un élément
   */
  const createSuccessParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      particle.className = 'fixed w-2 h-2 rounded-full bg-emerald-400 z-50 pointer-events-none'
      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      document.body.appendChild(particle)

      const angle = (i / 12) * Math.PI * 2
      const distance = 50 + Math.random() * 50

      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => particle.remove()
      })
    }
  }

  /**
   * Crée des confettis pour la victoire
   */
  const createVictoryConfetti = () => {
    const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'fixed w-3 h-3 z-50 pointer-events-none'
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = `${Math.random() * window.innerWidth}px`
      confetti.style.top = '-20px'
      document.body.appendChild(confetti)

      gsap.to(confetti, {
        y: window.innerHeight + 50,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 720,
        opacity: [1, 1, 0],
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: "power2.in",
        onComplete: () => confetti.remove()
      })
    }
  }

  /**
   * Pulse animation pour attirer l'attention
   */
  const animatePulse = (element: HTMLElement) => {
    gsap.to(element, {
      scale: [1, 1.05, 1],
      duration: 0.6,
      repeat: -1,
      ease: "power2.inOut"
    })
  }

  return {
    animateCardDeal,
    animateCoinTransfer,
    animateBluffSuccess,
    animateBluffFailed,
    animateCardFlip,
    animateCardElimination,
    animateAttack,
    animateModalShow,
    animateModalHide,
    animateTurnChange,
    animateVictory,
    animatePulse
  }
}
