<script lang="ts">
  import '../app.css';
  import { waitLocale } from '$lib/i18n';
  import { Toast } from '$components';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
  let i18nReady = false;
  
  // Wait for locale to load
  waitLocale().then(() => {
    i18nReady = true;
  });
  
  // Register service worker for PWA
  onMount(async () => {
    if (browser && 'serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (e) {
        console.log('Service worker registration failed:', e);
      }
    }
  });
</script>

{#if i18nReady}
  <Toast />
  <slot />
{:else}
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div class="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
  </div>
{/if}
