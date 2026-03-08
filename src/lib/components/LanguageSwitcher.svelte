<script lang="ts">
  import { locale } from '$lib/i18n'

  function toggleLanguage() {
    $locale = $locale === 'es' ? 'en' : 'es'
    localStorage.setItem('locale', $locale)
  }
</script>

<button
  class="text-sm font-medium text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800"
  on:click={toggleLanguage}
  type="button"
>
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
  <span class="uppercase">{$locale || 'en'}</span>
</button>
