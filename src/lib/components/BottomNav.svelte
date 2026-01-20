<script lang="ts">
  import { page } from '$app/stores';
  import { _ } from 'svelte-i18n';
  
  const navItems = [
    { href: '/app', icon: 'home', labelKey: 'nav.home' },
    { href: '/app/log', icon: 'plus', labelKey: 'nav.log' },
    { href: '/app/stats', icon: 'chart', labelKey: 'nav.stats' },
    { href: '/app/settings', icon: 'settings', labelKey: 'nav.settings' }
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<nav class="bottom-nav z-50">
  <div class="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
    {#each navItems as item}
      {@const isActive = currentPath === item.href || 
        (item.href !== '/app' && currentPath.startsWith(item.href))}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 tap-highlight
          {isActive ? 'text-accent' : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'}"
        aria-current={isActive ? 'page' : undefined}
      >
        <span class="w-6 h-6 {isActive ? 'scale-110' : ''} transition-transform">
          {#if item.icon === 'home'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          {:else if item.icon === 'plus'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          {:else if item.icon === 'chart'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          {:else if item.icon === 'settings'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          {/if}
        </span>
        <span class="text-[10px] font-medium">{$_(item.labelKey)}</span>
      </a>
    {/each}
  </div>
</nav>
