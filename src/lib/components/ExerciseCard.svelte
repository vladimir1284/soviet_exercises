<script lang="ts">
  import { _ } from 'svelte-i18n'
  import ProgressRing from './ProgressRing.svelte'
  import type { Exercise, Cycle } from '$stores'

  export let exercise: Exercise
  export let cycle: Cycle | undefined = undefined
  export let completedSets: number = 0
  export let pendingSets: number = 0
  export let needsRecalibration: boolean = false
  export let onLog: (() => void) | undefined = undefined
  export let onConfigure: (() => void) | undefined = undefined

  $: totalSets = cycle?.setsPerDay ?? 0
  $: totalCompleted = completedSets + pendingSets
  $: progress = totalSets > 0 ? (totalCompleted / totalSets) * 100 : 0
  $: isComplete = totalCompleted >= totalSets && totalSets > 0
  $: isSyncing = pendingSets > 0
</script>

<article class="card-interactive p-4 animate-fade-in" style="--accent-color: {exercise.color};">
  <div class="flex items-start gap-4">
    <!-- Icon & Progress -->
    <div class="relative">
      {#if cycle}
        <ProgressRing {progress} size={72} strokeWidth={6} color={exercise.color}>
          <div class="relative flex items-center justify-center">
            <span class="text-2xl">{exercise.icon}</span>
            {#if isSyncing}
              <div
                class="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center animate-pulse shadow-sm"
              >
                <svg
                  class="w-2.5 h-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </div>
            {/if}
          </div>
        </ProgressRing>
      {:else}
        <div
          class="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl"
          style="background-color: {exercise.color}20;"
        >
          {exercise.icon}
        </div>
      {/if}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-display font-semibold text-lg text-surface-900 dark:text-surface-900 truncate">
        {exercise.name}
      </h3>

      {#if needsRecalibration}
        <div class="mt-1 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span class="text-sm font-medium">{$_('home.recalibrate')}</span>
        </div>
      {:else if cycle}
        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
          {$_('home.setsCompleted', { values: { count: totalCompleted, total: totalSets } })}
          {#if isSyncing}
            <span
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-[10px] font-bold text-accent uppercase tracking-wider animate-pulse"
            >
              {$_('common.syncing') || 'Syncing'}
            </span>
          {/if}
        </p>
        <p class="text-xs text-surface-400 dark:text-surface-500">
          {cycle.repsPerSet}
          {$_('log.reps')} × {totalSets}
        </p>
      {:else}
        <p class="mt-1 text-sm text-surface-400 dark:text-surface-500">
          {$_('exercises.configure')}
        </p>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2">
      {#if cycle && !needsRecalibration}
        <button
          class="btn btn-primary btn-icon"
          style="background-color: {exercise.color}; --tw-shadow-color: {exercise.color}40;"
          on:click={onLog}
          disabled={isComplete}
          aria-label={$_('home.quickLog')}
        >
          {#if isComplete}
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          {:else}
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          {/if}
        </button>
      {:else}
        <button class="btn btn-secondary btn-icon" on:click={onConfigure} aria-label={$_('exercises.configure')}>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>
</article>
