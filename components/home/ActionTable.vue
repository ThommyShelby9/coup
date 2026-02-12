<template>
  <div class="action-table-container">
    <h3 class="section-title font-medieval text-2xl text-gold-400 text-center mb-8">
      Actions Disponibles
    </h3>

    <div class="table-wrapper glass-panel">
      <table class="action-table">
        <thead>
          <tr>
            <th class="text-left">
              <Icon name="lucide:zap" class="w-4 h-4 inline mr-2" />
              Action
            </th>
            <th class="text-center">
              <Icon name="lucide:coins" class="w-4 h-4 inline mr-2" />
              Coût
            </th>
            <th class="text-left">
              <Icon name="lucide:sparkles" class="w-4 h-4 inline mr-2" />
              Effet
            </th>
            <th class="text-center">
              <Icon name="lucide:shield" class="w-4 h-4 inline mr-2" />
              Bloquable
            </th>
            <th class="text-center">
              <Icon name="lucide:alert-circle" class="w-4 h-4 inline mr-2" />
              Contestable
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(action, index) in actions"
            :key="action.name"
            :class="{ 'role-action': action.role }"
          >
            <td class="action-name">
              <div class="flex items-center gap-2">
                <span class="font-medium text-royal-100">{{ action.name }}</span>
                <span
                  v-if="action.role"
                  class="role-badge"
                  :class="`role-${action.role.toLowerCase()}`"
                >
                  {{ action.role }}
                </span>
              </div>
            </td>
            <td class="text-center">
              <span
                v-if="action.cost > 0"
                class="cost-badge"
              >
                {{ action.cost }}
              </span>
              <span v-else class="text-royal-400">-</span>
            </td>
            <td>
              <span class="text-royal-200 text-sm">{{ action.effect }}</span>
            </td>
            <td class="text-center">
              <div v-if="action.blockable" class="flex items-center justify-center gap-1">
                <Icon name="lucide:check" class="w-4 h-4 text-emerald-400" />
                <span v-if="action.blocker" class="text-xs text-royal-300">
                  ({{ action.blocker }})
                </span>
              </div>
              <Icon v-else name="lucide:x" class="w-4 h-4 text-royal-500 mx-auto" />
            </td>
            <td class="text-center">
              <Icon
                v-if="action.challengeable"
                name="lucide:check"
                class="w-4 h-4 text-emerald-400 mx-auto"
              />
              <Icon
                v-else
                name="lucide:x"
                class="w-4 h-4 text-royal-500 mx-auto"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Légende -->
    <div class="legend glass-panel mt-4 p-4">
      <div class="legend-items">
        <div class="legend-item">
          <Icon name="lucide:info" class="w-4 h-4 text-blue-400" />
          <span class="text-sm text-royal-300">
            Les actions avec un rôle peuvent être bluffées
          </span>
        </div>
        <div class="legend-item">
          <Icon name="lucide:shield" class="w-4 h-4 text-emerald-400" />
          <span class="text-sm text-royal-300">
            Bloquable : peut être bloqué par certains rôles
          </span>
        </div>
        <div class="legend-item">
          <Icon name="lucide:alert-circle" class="w-4 h-4 text-orange-400" />
          <span class="text-sm text-royal-300">
            Contestable : les adversaires peuvent contester votre rôle
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { actions } from '~/utils/gameRules'

const { fadeIn, cleanup } = useScrollAnimations()

onMounted(() => {
  if (process.client) {
    nextTick(() => {
      fadeIn('.action-table-container', {
        trigger: '.action-table-container',
        start: 'top 75%',
        duration: 1
      })
    })
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.action-table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section-title {
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
}

.table-wrapper {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 1rem;
  overflow: hidden;
}

.action-table {
  width: 100%;
  border-collapse: collapse;
}

.action-table thead {
  background: rgba(15, 23, 42, 0.6);
}

.action-table thead th {
  padding: 1rem;
  font-family: 'Cinzel', serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(251, 191, 36, 0.3);
}

.action-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(251, 191, 36, 0.1);
}

.action-table tbody tr:hover {
  background: rgba(251, 191, 36, 0.05);
  border-color: rgba(251, 191, 36, 0.3);
}

.action-table tbody tr.role-action {
  background: rgba(139, 92, 246, 0.05);
}

.action-table tbody tr.role-action:hover {
  background: rgba(139, 92, 246, 0.15);
}

.action-table tbody td {
  padding: 1rem;
  color: #cbd5e1;
}

.action-name {
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.role-duke {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.role-assassin {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.role-captain {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-ambassador {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.role-contessa {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.cost-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.legend {
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 0.75rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .action-table {
    font-size: 0.875rem;
  }

  .action-table thead th,
  .action-table tbody td {
    padding: 0.75rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .action-table-container {
    padding: 1rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .action-table {
    min-width: 600px;
    font-size: 0.8rem;
  }

  .action-table thead th,
  .action-table tbody td {
    padding: 0.5rem 0.375rem;
  }

  .legend-items {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-table-container {
    opacity: 1;
  }

  .action-table tbody tr {
    transition: none;
  }
}
</style>
