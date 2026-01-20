<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let selected: string = '#6366f1'

  const dispatch = createEventDispatcher()

  const colors = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#84cc16',
    '#22c55e',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#64748b',
  ]

  function select(color: string) {
    selected = color
    dispatch('select', color)
  }
</script>

<div class="grid grid-cols-8 gap-2">
  {#each colors as color}
    <button
      type="button"
      class="w-9 h-9 rounded-lg transition-all
        {selected === color
        ? 'ring-2 ring-offset-2 ring-offset-surface-50 dark:ring-offset-surface-100 scale-105'
        : 'hover:scale-105'}"
      style="background-color: {color}; {selected === color ? `--tw-ring-color: ${color};` : ''}"
      on:click={() => select(color)}
      aria-label="Color {color}"
    >
      {#if selected === color}
        <svg class="w-4 h-4 mx-auto text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      {/if}
    </button>
  {/each}
</div>
