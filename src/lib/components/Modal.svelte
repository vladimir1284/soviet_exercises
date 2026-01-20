<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  export let open: boolean = false;
  export let title: string = '';
  export let showClose: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  function close() {
    dispatch('close');
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    transition:fade={{ duration: 200 }}
    on:click={close}
    on:keydown={(e) => e.key === 'Enter' && close()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  />
  
  <!-- Modal -->
  <div 
    class="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
           bg-white dark:bg-surface-100 rounded-t-3xl md:rounded-2xl shadow-soft-lg z-50 
           max-h-[85vh] md:max-h-[80vh] md:w-full md:max-w-md overflow-hidden safe-bottom"
    transition:fly={{ y: 100, duration: 300 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Handle for mobile -->
    <div class="md:hidden flex justify-center py-3">
      <div class="w-10 h-1 bg-surface-300 dark:bg-surface-300 rounded-full" />
    </div>
    
    <!-- Header -->
    <div class="flex items-center justify-between px-6 pb-4 md:pt-6 border-b border-surface-200/50 dark:border-surface-200/20">
      <h2 id="modal-title" class="font-display font-semibold text-xl text-surface-900 dark:text-surface-900">
        {title}
      </h2>
      {#if showClose}
        <button 
          class="btn btn-ghost btn-icon -mr-2"
          on:click={close}
          aria-label={$_('common.cancel')}
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      {/if}
    </div>
    
    <!-- Content -->
    <div class="p-6 overflow-y-auto max-h-[60vh]">
      <slot />
    </div>
    
    <!-- Footer -->
    {#if $$slots.footer}
      <div class="px-6 py-4 border-t border-surface-200/50 dark:border-surface-200/20 bg-surface-50 dark:bg-surface-100/50">
        <slot name="footer" />
      </div>
    {/if}
  </div>
{/if}
