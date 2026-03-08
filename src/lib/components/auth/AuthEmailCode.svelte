<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { createEventDispatcher } from 'svelte'

  export let email: string = ''
  export let error: string = ''
  export let isSubmitting: boolean = false

  const dispatch = createEventDispatcher<{
    submit: void
  }>()

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') dispatch('submit')
  }
</script>

<div class="space-y-4">
  <!-- Hint banner -->
  <div class="flex items-start gap-3 p-3 rounded-xl bg-accent/8 dark:bg-accent/10 border border-accent/20">
    <svg
      class="w-4 h-4 mt-0.5 text-accent shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
    <p class="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
      {$_('auth.codeHint')}
    </p>
  </div>

  <div>
    <label for="email-code" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
      {$_('auth.email')}
    </label>
    <input
      id="email-code"
      type="email"
      bind:value={email}
      on:keydown={onKeydown}
      placeholder="you@example.com"
      autocomplete="email"
      autofocus
      class="w-full input input-bordered"
      class:input-error={!!error}
      disabled={isSubmitting}
    />
  </div>

  {#if error}
    <p class="text-sm text-error flex items-center gap-1.5" role="alert">
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
          x1="12"
          y1="16"
          x2="12.01"
          y2="16"
        />
      </svg>
      {error}
    </p>
  {/if}

  <button
    class="w-full btn btn-primary btn-lg"
    on:click={() => dispatch('submit')}
    disabled={!email.trim() || isSubmitting}
  >
    {#if isSubmitting}
      <span class="loading loading-spinner loading-sm" />
    {:else}
      {$_('auth.sendCode')}
    {/if}
  </button>
</div>
