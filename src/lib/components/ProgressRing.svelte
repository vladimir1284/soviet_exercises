<script lang="ts">
  export let progress: number = 0;
  export let size: number = 120;
  export let strokeWidth: number = 8;
  export let color: string = 'rgb(var(--accent))';
  export let bgColor: string = 'rgb(var(--surface-200))';
  export let showPercentage: boolean = false;
  
  $: radius = (size - strokeWidth) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: offset = circumference - (Math.min(progress, 100) / 100) * circumference;
  $: center = size / 2;
</script>

<div class="relative inline-flex items-center justify-center" style="width: {size}px; height: {size}px;">
  <svg class="progress-ring" width={size} height={size}>
    <!-- Background circle -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={bgColor}
      stroke-width={strokeWidth}
    />
    <!-- Progress circle -->
    <circle
      class="progress-ring-circle"
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
    />
  </svg>
  
  <div class="absolute inset-0 flex items-center justify-center">
    {#if showPercentage}
      <span class="num-display text-2xl text-surface-900 dark:text-surface-900">
        {Math.round(progress)}%
      </span>
    {:else}
      <slot />
    {/if}
  </div>
</div>
