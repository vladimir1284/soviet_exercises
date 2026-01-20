<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let selected: string = '💪'

  const dispatch = createEventDispatcher()

  const exerciseEmojis = [
    '💪',
    '🏋️',
    '🤸',
    '🧘',
    '🏃',
    '🚴',
    '🏊',
    '⛹️',
    '🥊',
    '🥋',
    '⚽',
    '🏀',
    '🎾',
    '🏐',
    '🧗',
    '🚣',
    '🔥',
    '💥',
    '✨',
    '🏆',
    '🥇',
    '💯',
    '⚡',
    '🎯',
  ]

  function select(emoji: string) {
    selected = emoji
    dispatch('select', emoji)
  }
</script>

<div class="grid grid-cols-8 gap-1.5">
  {#each exerciseEmojis as emoji}
    <button
      type="button"
      class="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all
        {selected === emoji
        ? 'bg-accent/20 ring-2 ring-accent scale-105'
        : 'hover:bg-surface-200/50 dark:hover:bg-surface-200/30'}"
      on:click={() => select(emoji)}
    >
      {emoji}
    </button>
  {/each}
</div>
