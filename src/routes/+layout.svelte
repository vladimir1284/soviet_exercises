<script lang="ts">
  import '../app.css';
  import '$lib/i18n';
  import { Toast } from '$components';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  
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

<Toast />
<slot />
