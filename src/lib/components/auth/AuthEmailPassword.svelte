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
  <div>
    <label for="email-pw" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
      {$_('auth.email')}
    </label>
    <input
      id="email-pw"
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
      {$_('auth.signIn')}
    {/if}
  </button>
</div>
