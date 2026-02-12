import { gsap } from 'gsap'

export const useGameAnimations = () => {
  /**
   * Animation de transfert de pièces entre joueurs
   */
  const animateCoinTransfer = (fromElement: HTMLElement, toElement: HTMLElement, amount: number) => {
    const fromRect = fromElement.getBoundingClientRect()
    const toRect = toElement.getBoundingClientRect()

    for (let i = 0; i < Math.min(amount, 5); i++) {
      const coin = document.createElement('div')
      coin.className = 'coin-particle'
      coin.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>'
      coin.style.cssText = `
        position: fixed;
        left: ${fromRect.left + fromRect.width / 2}px;
        top: ${fromRect.top + fromRect.height / 2}px;
        color: #fbbf24;
        z-index: 9999;
        pointer-events: none;
        filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.8));
      `

      document.body.appendChild(coin)

      gsap.to(coin, {
        x: toRect.left - fromRect.left + (Math.random() * 20 - 10),
        y: toRect.top - fromRect.top + (Math.random() * 20 - 10),
        rotation: 720 + Math.random() * 360,
        scale: 1.5,
        duration: 0.8 + i * 0.1,
        delay: i * 0.15,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(coin, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            onComplete: () => coin.remove()
          })
        }
      })
    }
  }

  /**
   * Animation de confettis pour la victoire
   */
  const celebrateVictory = () => {
    const colors = ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
    const confettiCount = 50

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div')
      confetti.className = 'confetti-particle'
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: -20px;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        z-index: 9999;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      `

      document.body.appendChild(confetti)

      gsap.to(confetti, {
        y: window.innerHeight + 100,
        x: `+=${Math.random() * 400 - 200}`,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: 2 + Math.random() * 2,
        delay: i * 0.05,
        ease: 'power1.in',
        onComplete: () => confetti.remove()
      })
    }
  }

  /**
   * Animation de révélation de carte
   */
  const revealCard = (cardElement: HTMLElement) => {
    const timeline = gsap.timeline()

    timeline
      .to(cardElement, {
        rotateY: 90,
        duration: 0.3,
        ease: 'power2.in'
      })
      .set(cardElement, {
        // Change le contenu ici si nécessaire
      })
      .to(cardElement, {
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out'
      })
      .to(cardElement, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      })

    return timeline
  }

  /**
   * Animation de shake pour les actions refusées
   */
  const shakeElement = (element: HTMLElement) => {
    gsap.to(element, {
      x: -10,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(element, { x: 0 })
      }
    })
  }

  /**
   * Animation de pulse pour attirer l'attention
   */
  const pulseElement = (element: HTMLElement, color: string = '#fbbf24') => {
    gsap.to(element, {
      boxShadow: `0 0 30px ${color}, 0 0 60px ${color}`,
      duration: 0.5,
      yoyo: true,
      repeat: 3,
      ease: 'power2.inOut'
    })
  }

  /**
   * Animation de distribution de cartes
   */
  const dealCards = (cardElements: HTMLElement[], delay: number = 0.1) => {
    cardElements.forEach((card, index) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          scale: 0,
          rotation: Math.random() * 360,
          x: 0,
          y: -200
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          x: 0,
          y: 0,
          duration: 0.6,
          delay: index * delay,
          ease: 'back.out(1.7)'
        }
      )
    })
  }

  /**
   * Animation d'élimination de joueur
   */
  const eliminatePlayer = (playerElement: HTMLElement) => {
    const timeline = gsap.timeline()

    timeline
      .to(playerElement, {
        scale: 1.1,
        duration: 0.2
      })
      .to(playerElement, {
        scale: 0.8,
        opacity: 0.5,
        filter: 'grayscale(1)',
        duration: 0.5,
        ease: 'power2.out'
      })

    return timeline
  }

  /**
   * Animation de début de tour
   */
  const startTurnAnimation = (playerElement: HTMLElement) => {
    gsap.fromTo(playerElement,
      {
        scale: 1
      },
      {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      }
    )
  }

  return {
    animateCoinTransfer,
    celebrateVictory,
    revealCard,
    shakeElement,
    pulseElement,
    dealCards,
    eliminatePlayer,
    startTurnAnimation
  }
}
