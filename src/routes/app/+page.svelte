<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { goto } from '$app/navigation'
  import { ExerciseCard, Modal, EmojiPicker, ColorPicker } from '$components'
  import { user, exercises, cycles, todaySets, todayProgress, settings, toasts, needsRecalibration } from '$stores'
  import type { Exercise, Cycle } from '$stores'

  // Modal state
  let showAddExercise = false
  let showConfigureCycle = false
  let selectedExercise: Exercise | null = null

  // Form state
  let newExercise = { name: '', icon: '💪', color: '#6366f1' }
  let cycleConfig = { maxReps: 0, repsPerSet: 0 }

  // Get active cycle for an exercise
  function getActiveCycle(exerciseId: number): Cycle | undefined {
    return $cycles.find(c => c.exerciseId === exerciseId && c.isActive)
  }

  // Get completed sets for today
  function getCompletedSets(exerciseId: number): number {
    return $todayProgress[exerciseId]?.completed || 0
  }

  // Check if exercise needs recalibration
  function checkNeedsRecalibration(exerciseId: number): boolean {
    const cycle = getActiveCycle(exerciseId)
    return cycle ? needsRecalibration(cycle) : false
  }

  // Handle quick log
  async function handleQuickLog(exercise: Exercise) {
    const cycle = getActiveCycle(exercise.id)
    if (!cycle) return

    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: cycle.id,
          repsCompleted: cycle.repsPerSet,
        }),
      })

      if (response.ok) {
        const newSet = await response.json()
        todaySets.update(sets => [newSet, ...sets])
        toasts.add({ message: $_('log.logged'), type: 'success' })
      }
    } catch (e) {
      toasts.add({ message: $_('common.error'), type: 'error' })
    }
  }

  // Handle configure cycle
  function handleConfigure(exercise: Exercise) {
    selectedExercise = exercise
    cycleConfig = { maxReps: 0, repsPerSet: 0 }
    showConfigureCycle = true
  }

  // Calculate reps per set
  $: if (cycleConfig.maxReps > 0) {
    cycleConfig.repsPerSet = Math.floor(cycleConfig.maxReps / 2)
  }

  // Save new exercise
  async function saveExercise() {
    if (!newExercise.name.trim() || !$user?.id) return

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newExercise, userId: $user.id }),
      })

      if (response.ok) {
        const exercise = await response.json()
        exercises.update(list => [...list, exercise])
        showAddExercise = false
        newExercise = { name: '', icon: '💪', color: '#6366f1' }
        toasts.add({ message: $_('log.logged'), type: 'success' })

        // Open configure modal
        handleConfigure(exercise)
      }
    } catch (e) {
      toasts.add({ message: $_('common.error'), type: 'error' })
    }
  }

  // Save cycle configuration
  async function saveCycle() {
    if (!selectedExercise || cycleConfig.maxReps <= 0) return

    try {
      const response = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExercise.id,
          maxReps: cycleConfig.maxReps,
          repsPerSet: cycleConfig.repsPerSet,
          setsPerDay: $settings.defaultSetsPerDay,
          daysPerWeek: $settings.defaultDaysPerWeek,
          durationWeeks: $settings.defaultCycleWeeks,
        }),
      })

      if (response.ok) {
        const cycle = await response.json()
        cycles.update(list => [...list.filter(c => c.exerciseId !== selectedExercise!.id || !c.isActive), cycle])
        showConfigureCycle = false
        selectedExercise = null
        toasts.add({ message: $_('exercises.startCycle'), type: 'success' })
      }
    } catch (e) {
      toasts.add({ message: $_('common.error'), type: 'error' })
    }
  }

  // Calculate overall progress
  $: totalSets = Object.values($todayProgress).reduce((sum, p) => sum + p.total, 0)
  $: completedSets = Object.values($todayProgress).reduce((sum, p) => sum + p.completed, 0)
  $: overallProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0
</script>

<svelte:head>
  <title>{$_('nav.home')} - {$_('app.name')}</title>
</svelte:head>

<div class="px-4 py-6 space-y-6">
  <!-- Header -->
  <header class="space-y-1">
    <h1 class="font-display font-bold text-2xl text-surface-900 dark:text-surface-900">
      {$_('home.greeting', { values: { name: $user?.name || 'User' } })}
    </h1>
    <p class="text-surface-500 dark:text-surface-400">
      {new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}
    </p>
  </header>

  <!-- Today's Progress Card -->
  {#if totalSets > 0}
    <section class="card p-5 animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-surface-900 dark:text-surface-900">
          {$_('home.todayProgress')}
        </h2>
        <span class="text-sm text-surface-500 dark:text-surface-400">
          {$_('home.setsCompleted', {
            values: { count: completedSets, total: totalSets },
          })}
        </span>
      </div>

      <!-- Progress bar -->
      <div class="h-3 bg-surface-200 dark:bg-surface-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-500 ease-out"
          style="width: {overallProgress}%;"
        />
      </div>

      {#if completedSets >= totalSets}
        <p class="mt-3 text-center text-green-600 dark:text-green-400 font-medium">
          {$_('log.allDone')}
        </p>
      {/if}
    </section>
  {/if}

  <!-- Exercises -->
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="section-header mb-0">
        {$_('exercises.title')}
      </h2>
      <button class="btn btn-ghost btn-sm text-accent" on:click={() => (showAddExercise = true)}>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {$_('exercises.add')}
      </button>
    </div>

    {#if $exercises.length === 0}
      <!-- Empty state -->
      <div class="card p-8 text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-surface-200/50 dark:bg-surface-200/30 rounded-2xl flex items-center justify-center"
        >
          <span class="text-3xl">💪</span>
        </div>
        <h3 class="font-semibold text-surface-900 dark:text-surface-900 mb-2">
          {$_('home.noExercises')}
        </h3>
        <button class="btn btn-primary btn-md mt-4" on:click={() => (showAddExercise = true)}>
          {$_('home.addExercise')}
        </button>
      </div>
    {:else}
      <div class="space-y-3">
        {#each $exercises.filter(e => e.isActive) as exercise (exercise.id)}
          {@const cycle = $cycles.find(c => c.exerciseId === exercise.id && c.isActive)}
          <ExerciseCard
            {exercise}
            {cycle}
            completedSets={$todayProgress[exercise.id]?.completed || 0}
            needsRecalibration={cycle ? needsRecalibration(cycle) : false}
            onLog={() => handleQuickLog(exercise)}
            onConfigure={() => handleConfigure(exercise)}
          />
        {/each}
      </div>
    {/if}
  </section>
</div>

<!-- Add Exercise Modal -->
<Modal bind:open={showAddExercise} title={$_('exercises.add')} on:close={() => (showAddExercise = false)}>
  <form class="space-y-6" on:submit|preventDefault={saveExercise}>
    <div>
      <label for="exercise-name" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('exercises.name')}
      </label>
      <input
        id="exercise-name"
        type="text"
        class="input"
        placeholder={$_('exercises.namePlaceholder')}
        bind:value={newExercise.name}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('exercises.icon')}
      </label>
      <EmojiPicker bind:selected={newExercise.icon} />
    </div>

    <div>
      <label class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('exercises.color')}
      </label>
      <ColorPicker bind:selected={newExercise.color} />
    </div>
  </form>

  <svelte:fragment slot="footer">
    <div class="flex gap-3">
      <button class="btn btn-secondary btn-md flex-1" on:click={() => (showAddExercise = false)}>
        {$_('common.cancel')}
      </button>
      <button class="btn btn-primary btn-md flex-1" on:click={saveExercise}>
        {$_('common.save')}
      </button>
    </div>
  </svelte:fragment>
</Modal>

<!-- Configure Cycle Modal -->
<Modal
  bind:open={showConfigureCycle}
  title={$_('exercises.configure')}
  on:close={() => {
    showConfigureCycle = false
    selectedExercise = null
  }}
>
  {#if selectedExercise}
    <form class="space-y-4" on:submit|preventDefault={saveCycle}>
      <div class="flex items-center gap-4 p-4 bg-surface-100 dark:bg-surface-100/50 rounded-xl">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style="background-color: {selectedExercise.color}20;"
        >
          {selectedExercise.icon}
        </div>
        <div>
          <h3 class="font-semibold text-surface-900 dark:text-surface-900">
            {selectedExercise.name}
          </h3>
        </div>
      </div>

      <div>
        <label for="max-reps" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
          {$_('exercises.maxReps')}
        </label>
        <input
          id="max-reps"
          type="number"
          class="input text-center text-2xl font-display"
          min="1"
          placeholder="0"
          bind:value={cycleConfig.maxReps}
          required
        />
        <p class="mt-2 text-sm text-surface-500 dark:text-surface-400">
          {$_('exercises.maxRepsHelp')}
        </p>
      </div>

      {#if cycleConfig.maxReps > 0}
        <div class="p-4 bg-accent/10 rounded-xl animate-scale-in">
          <div class="flex items-center justify-between">
            <span class="text-sm text-surface-600 dark:text-surface-600">
              {$_('exercises.repsPerSet')}
            </span>
            <span class="num-display text-2xl text-accent">
              {cycleConfig.repsPerSet}
            </span>
          </div>
          <p class="mt-1 text-xs text-surface-500 dark:text-surface-400">
            {$_('exercises.repsPerSetHelp')}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-center">
          <div class="p-3 bg-surface-100 dark:bg-surface-100/50 rounded-xl">
            <span class="num-display text-xl text-surface-900 dark:text-surface-900">
              {$settings.defaultSetsPerDay}
            </span>
            <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {$_('exercises.setsPerDay')}
            </p>
          </div>
          <div class="p-3 bg-surface-100 dark:bg-surface-100/50 rounded-xl">
            <span class="num-display text-xl text-surface-900 dark:text-surface-900">
              {$settings.defaultCycleWeeks}
            </span>
            <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {$_('exercises.cycleWeeks')}
            </p>
          </div>
        </div>
      {/if}
    </form>
  {/if}

  <svelte:fragment slot="footer">
    <div class="flex gap-3">
      <button
        class="btn btn-secondary btn-md flex-1"
        on:click={() => {
          showConfigureCycle = false
          selectedExercise = null
        }}
      >
        {$_('common.cancel')}
      </button>
      <button class="btn btn-primary btn-md flex-1" on:click={saveCycle} disabled={cycleConfig.maxReps <= 0}>
        {$_('exercises.startCycle')}
      </button>
    </div>
  </svelte:fragment>
</Modal>
