<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { onMount } from 'svelte'
  import { ProgressRing } from '$components'
  import { user, exercises, cycles } from '$stores'
  import { getLocalDateString } from '$lib/utils/date'

  // Stats data
  let stats = {
    totalSets: 0,
    totalReps: 0,
    activeDays: 0,
    currentStreak: 0,
    bestStreak: 0,
  }

  let weekStats: { date: string; sets: number }[] = []
  let cycleHistory: {
    id: number
    exerciseName: string
    maxReps: number
    startDate: string
    endDate: string
  }[] = []
  let isLoading = true

  // Period selection
  type Period = 'week' | 'month' | 'all'
  let selectedPeriod: Period = 'week'

  // Watch for user to load
  $: if ($user?.id) {
    loadStats()
  }

  async function loadStats() {
    if (!$user?.id) return

    isLoading = true
    try {
      const localDate = getLocalDateString()
      const response = await fetch(`/api/stats?userId=${$user.id}&localDate=${localDate}`)
      if (response.ok) {
        const data = await response.json()
        stats = data.stats
        weekStats = data.weekStats || []
        cycleHistory = data.cycleHistory || []
      }
    } catch (e) {
      console.error('Failed to load stats:', e)
    } finally {
      isLoading = false
    }
  }

  // Calculate max for week chart
  $: maxSets = Math.max(...weekStats.map(d => d.sets), 1)

  // Group cycles by exercise for progress tracking
  $: cyclesByExercise = cycleHistory.reduce(
    (acc, cycle) => {
      if (!acc[cycle.exerciseName]) acc[cycle.exerciseName] = []
      acc[cycle.exerciseName].push(cycle)
      return acc
    },
    {} as Record<string, typeof cycleHistory>,
  )

  // Calculate progress only for exercises with multiple cycles
  $: exercisesWithProgress = Object.entries(cyclesByExercise)
    .filter(([_, cycles]) => cycles.length > 1)
    .map(([name, cycles]) => {
      // Sort by date ascending to get first and last
      const sortedCycles = [...cycles].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      const firstMax = sortedCycles[0]?.maxReps || 0
      const lastMax = sortedCycles[sortedCycles.length - 1]?.maxReps || 0
      const improvement = lastMax - firstMax
      const percentImprovement = firstMax > 0 ? ((improvement / firstMax) * 100).toFixed(1) : '0'
      return { name, firstMax, lastMax, improvement, percentImprovement }
    })

  // Get day name
  function getDayName(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, { weekday: 'short' })
  }

  // Check if today
  function isToday(dateStr: string): boolean {
    return dateStr === getLocalDateString()
  }
</script>

<svelte:head>
  <title>{$_('nav.stats')} - {$_('app.name')}</title>
</svelte:head>

<div class="px-4 py-6 space-y-6">
  <!-- Header -->
  <header>
    <h1 class="font-display font-bold text-2xl text-surface-900 dark:text-surface-900">
      {$_('stats.title')}
    </h1>
  </header>

  {#if isLoading}
    <div class="space-y-4">
      {#each [1, 2, 3] as _}
        <div class="card p-6">
          <div class="skeleton h-6 w-1/3 mb-4" />
          <div class="skeleton h-12 w-1/2" />
        </div>
      {/each}
    </div>
  {:else}
    <!-- Summary cards -->
    <div class="grid grid-cols-2 gap-3">
      <div class="card p-4 animate-fade-in">
        <p class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          {$_('stats.totalSets')}
        </p>
        <p class="num-display text-3xl text-surface-900 dark:text-surface-900 mt-1">
          {stats.totalSets.toLocaleString()}
        </p>
      </div>

      <div class="card p-4 animate-fade-in" style="animation-delay: 0.05s;">
        <p class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          {$_('stats.totalReps')}
        </p>
        <p class="num-display text-3xl text-surface-900 dark:text-surface-900 mt-1">
          {stats.totalReps.toLocaleString()}
        </p>
      </div>

      <div class="card p-4 animate-fade-in" style="animation-delay: 0.1s;">
        <p class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          {$_('stats.currentStreak')}
        </p>
        <div class="flex items-baseline gap-1 mt-1">
          <p class="num-display text-3xl text-accent">
            {stats.currentStreak}
          </p>
          <span class="text-sm text-surface-500 dark:text-surface-400">
            {$_('stats.days')}
          </span>
        </div>
      </div>

      <div class="card p-4 animate-fade-in" style="animation-delay: 0.15s;">
        <p class="text-xs text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          {$_('stats.bestStreak')}
        </p>
        <div class="flex items-baseline gap-1 mt-1">
          <p class="num-display text-3xl text-purple-500">
            {stats.bestStreak}
          </p>
          <span class="text-sm text-surface-500 dark:text-surface-400">
            {$_('stats.days')}
          </span>
        </div>
      </div>
    </div>

    <!-- Week chart -->
    <section class="card p-5 animate-fade-in" style="animation-delay: 0.2s;">
      <h2 class="font-semibold text-surface-900 dark:text-surface-900 mb-4">
        {$_('stats.thisWeek')}
      </h2>

      {#if weekStats.length > 0}
        <div class="flex items-end justify-between gap-2 h-32">
          {#each weekStats as day}
            {@const height = (day.sets / maxSets) * 100}
            <div class="flex-1 flex flex-col items-center gap-2">
              <div class="w-full flex flex-col items-center justify-end h-24">
                <span class="text-xs font-medium text-surface-600 dark:text-surface-500 mb-1">
                  {day.sets}
                </span>
                <div
                  class="w-full max-w-[32px] rounded-t-lg transition-all duration-500
                    {isToday(day.date) ? 'bg-accent' : 'bg-surface-300 dark:bg-surface-300'}"
                  style="height: {Math.max(height, 4)}%;"
                />
              </div>
              <span
                class="text-xs text-surface-500 dark:text-surface-400
                {isToday(day.date) ? 'font-semibold text-accent' : ''}"
              >
                {getDayName(day.date)}
              </span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-center text-surface-400 dark:text-surface-500 py-8">
          {$_('stats.noData')}
        </p>
      {/if}
    </section>

    <!-- Cycle history -->
    {#if cycleHistory.length > 0}
      <section class="animate-fade-in" style="animation-delay: 0.25s;">
        <h2 class="section-header">{$_('stats.cycleHistory')}</h2>

        <div class="space-y-3">
          {#each cycleHistory as cycle}
            {@const exercise = $exercises.find(e => e.name === cycle.exerciseName)}
            <div class="card p-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style="background-color: {exercise?.color || '#6366f1'}20;"
                >
                  {exercise?.icon || '💪'}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-surface-900 dark:text-surface-900">
                    {cycle.exerciseName}
                  </p>
                  <p class="text-xs text-surface-500 dark:text-surface-400">
                    {new Date(cycle.startDate).toLocaleDateString()} -
                    {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : $_('exercises.active')}
                  </p>
                </div>
                <div class="text-right">
                  <p class="num-display text-xl text-surface-900 dark:text-surface-900">
                    {cycle.maxReps}
                  </p>
                  <p class="text-xs text-surface-500 dark:text-surface-400">max</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Max improvement chart - POR EJERCICIO -->
    {#if exercisesWithProgress.length > 0}
      <section class="card p-5 animate-fade-in" style="animation-delay: 0.3s;">
        <h2 class="font-semibold text-surface-900 dark:text-surface-900 mb-4">
          {$_('stats.maxImprovement')}
        </h2>

        <div class="space-y-4">
          {#each exercisesWithProgress as prog}
            {@const exercise = $exercises.find(e => e.name === prog.name)}
            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style="background-color: {exercise?.color || '#6366f1'}20;"
              >
                {exercise?.icon || '💪'}
              </div>

              <div class="flex-1 flex items-center justify-between">
                <div class="text-center">
                  <p class="text-xs text-surface-500 dark:text-surface-400 uppercase">
                    {$_('stats.first')}
                  </p>
                  <p class="num-display text-xl text-surface-900 dark:text-surface-900">
                    {prog.firstMax}
                  </p>
                </div>

                <div class="flex flex-col items-center">
                  <svg
                    class="w-6 h-6 {prog.improvement >= 0 ? 'text-green-500' : 'text-red-500'}"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span class="text-xs font-semibold {prog.improvement >= 0 ? 'text-green-500' : 'text-red-500'}">
                    {prog.improvement >= 0 ? '+' : ''}{prog.percentImprovement}%
                  </span>
                </div>

                <div class="text-center">
                  <p class="text-xs text-surface-500 dark:text-surface-400 uppercase">
                    {$_('stats.current')}
                  </p>
                  <p
                    class="num-display text-xl {prog.improvement >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'}"
                  >
                    {prog.lastMax}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>
