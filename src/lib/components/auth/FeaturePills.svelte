<script lang="ts">
  import { _ } from 'svelte-i18n'
</script>

<div class="mt-14 grid grid-cols-3 gap-6 text-center animate-slide-up" style="animation-delay: 0.2s;">
  <div class="space-y-2">
    <div
      class="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
    >
      <svg
        class="w-6 h-6 text-green-600 dark:text-green-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    </div>
    <p class="text-xs text-surface-700 dark:text-surface-300 font-medium">{$_('stats.progress')}</p>
  </div>
  <div class="space-y-2">
    <div class="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
      <svg
        class="w-6 h-6 text-blue-600 dark:text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
        /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </div>
    <p class="text-xs text-surface-700 dark:text-surface-300 font-medium">{$_('exercises.configure')}</p>
  </div>
  <div class="space-y-2">
    <div
      class="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
    >
      <svg
        class="w-6 h-6 text-purple-600 dark:text-purple-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    </div>
    <p class="text-xs text-surface-700 dark:text-surface-300 font-medium">{$_('stats.title')}</p>
  </div>
</div>
