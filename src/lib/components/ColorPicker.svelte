<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let selected: string = '#6366f1';
  
  const dispatch = createEventDispatcher();
  
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#eab308', // Yellow
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#0ea5e9', // Sky
    '#3b82f6', // Blue
    '#64748b', // Slate
  ];
  
  function select(color: string) {
    selected = color;
    dispatch('select', color);
  }
</script>

<div class="grid grid-cols-6 gap-3">
  {#each colors as color}
    <button
      type="button"
      class="w-10 h-10 rounded-xl transition-all
        {selected === color ? 'ring-2 ring-offset-2 ring-offset-surface-50 dark:ring-offset-surface-100 scale-110' : 'hover:scale-105'}"
      style="background-color: {color}; {selected === color ? `--tw-ring-color: ${color};` : ''}"
      on:click={() => select(color)}
      aria-label="Color {color}"
    >
      {#if selected === color}
        <svg class="w-5 h-5 mx-auto text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      {/if}
    </button>
  {/each}
</div>
