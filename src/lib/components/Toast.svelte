<script lang="ts">
  import { toasts } from '$stores'
  import { fly } from 'svelte/transition'
</script>

<div class="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none safe-top">
  {#each $toasts as toast (toast.id)}
    <div
      class="card px-4 py-3 shadow-soft-lg pointer-events-auto animate-slide-down
        {toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
        {toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
        {toast.type === 'info' ? 'border-l-4 border-l-accent' : ''}"
      transition:fly={{ y: -20, duration: 200 }}
    >
      <div class="flex items-center gap-3">
        {#if toast.type === 'success'}
          <svg
            class="w-5 h-5 text-green-500 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 11 15 8 12" />
          </svg>
        {:else if toast.type === 'error'}
          <svg
            class="w-5 h-5 text-red-500 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        {:else}
          <svg
            class="w-5 h-5 text-accent flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        {/if}
        <p class="text-sm text-surface-800 dark:text-surface-800">{toast.message}</p>
        <button
          class="ml-auto p-1 hover:bg-surface-200 dark:hover:bg-surface-200 rounded-lg transition-colors"
          on:click={() => toasts.remove(toast.id)}
        >
          <svg class="w-4 h-4 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>
