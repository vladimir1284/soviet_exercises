<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { ProgressRing, Modal } from '$components'
  import { exercises, cycles, todaySets, todayProgress, toasts } from '$stores'
  import type { Exercise, Cycle, SetLog } from '$stores'

  // Selected exercise
  let selectedExerciseId: number | null = null

  // Edit modal
  let showEditModal = false
  let editingSet: SetLog | null = null
  let editTime = ''
  let editNotes = ''

  // Get active exercises with cycles
  $: activeExercises = $exercises.filter(e => {
    const cycle = $cycles.find(c => c.exerciseId === e.id && c.isActive)
    return e.isActive && cycle
  })

  // Select first exercise by default
  $: if (activeExercises.length > 0 && !selectedExerciseId) {
    selectedExerciseId = activeExercises[0].id
  }

  // Get selected exercise and cycle
  $: selectedExercise = $exercises.find(e => e.id === selectedExerciseId)
  $: selectedCycle = selectedExerciseId ? $cycles.find(c => c.exerciseId === selectedExerciseId && c.isActive) : null

  // Get today's sets for selected exercise
  $: exerciseSets = selectedCycle
    ? $todaySets
        .filter(s => s.cycleId === selectedCycle.id)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    : []

  // Progress
  $: completedSets = exerciseSets.length
  $: totalSets = selectedCycle?.setsPerDay ?? 0
  $: progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  $: isComplete = completedSets >= totalSets
  $: nextSetNumber = completedSets + 1

  // Log a set
  async function logSet() {
    if (!selectedCycle || isComplete) return

    try {
      const response = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: selectedCycle.id,
          repsCompleted: selectedCycle.repsPerSet,
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

  // Open edit modal
  function openEdit(set: SetLog) {
    editingSet = set
    editTime = new Date(set.completedAt).toTimeString().slice(0, 5)
    editNotes = set.notes || ''
    showEditModal = true
  }

  // Save edit
  async function saveEdit() {
    if (!editingSet) return

    const today = new Date().toISOString().split('T')[0]
    const completedAt = `${today}T${editTime}:00`

    try {
      const response = await fetch(`/api/sets/${editingSet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt, notes: editNotes }),
      })

      if (response.ok) {
        const updated = await response.json()
        todaySets.update(sets => sets.map(s => (s.id === updated.id ? updated : s)))
        showEditModal = false
        editingSet = null
        toasts.add({ message: $_('common.save'), type: 'success' })
      }
    } catch (e) {
      toasts.add({ message: $_('common.error'), type: 'error' })
    }
  }

  // Delete set
  async function deleteSet() {
    if (!editingSet) return

    try {
      const response = await fetch(`/api/sets/${editingSet.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        todaySets.update(sets => sets.filter(s => s.id !== editingSet!.id))
        showEditModal = false
        editingSet = null
        toasts.add({ message: $_('log.undo'), type: 'info' })
      }
    } catch (e) {
      toasts.add({ message: $_('common.error'), type: 'error' })
    }
  }

  // Format time
  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
</script>

<svelte:head>
  <title>{$_('nav.log')} - {$_('app.name')}</title>
</svelte:head>

<div class="px-4 py-6 space-y-6">
  <!-- Header -->
  <header>
    <h1 class="font-display font-bold text-2xl text-surface-900 dark:text-surface-900">
      {$_('log.title')}
    </h1>
  </header>

  {#if activeExercises.length === 0}
    <!-- No exercises -->
    <div class="card p-8 text-center">
      <p class="text-surface-500 dark:text-surface-400">
        {$_('home.noExercises')}
      </p>
      <a href="/app" class="btn btn-primary btn-md mt-4">
        {$_('home.addExercise')}
      </a>
    </div>
  {:else}
    <!-- Exercise selector -->
    <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
      {#each activeExercises as exercise (exercise.id)}
        {@const cycle = $cycles.find(c => c.exerciseId === exercise.id && c.isActive)}
        {@const prog = $todayProgress[exercise.id]}
        <button
          class="flex-shrink-0 px-4 py-3 rounded-xl transition-all duration-200 tap-highlight
            {selectedExerciseId === exercise.id
            ? 'bg-white dark:bg-surface-100 shadow-soft ring-2'
            : 'bg-surface-200/50 dark:bg-surface-200/20'}"
          style={selectedExerciseId === exercise.id ? `--tw-ring-color: ${exercise.color};` : ''}
          on:click={() => (selectedExerciseId = exercise.id)}
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">{exercise.icon}</span>
            <div class="text-left">
              <p class="font-medium text-sm text-surface-900 dark:text-surface-900">
                {exercise.name}
              </p>
              <p class="text-xs text-surface-500 dark:text-surface-400">
                {prog?.completed ?? 0}/{cycle?.setsPerDay ?? 0}
              </p>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <!-- Main log button -->
    {#if selectedExercise && selectedCycle}
      <div class="flex flex-col items-center py-8 animate-fade-in">
        <!-- Progress ring with button -->
        <button class="relative group" on:click={logSet} disabled={isComplete}>
          <ProgressRing {progress} size={200} strokeWidth={12} color={selectedExercise.color}>
            <div class="flex flex-col items-center">
              {#if isComplete}
                <svg
                  class="w-16 h-16 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 10 11 15 8 12" />
                </svg>
              {:else}
                <span
                  class="num-display text-5xl text-surface-900 dark:text-surface-900 group-hover:scale-110 transition-transform"
                >
                  {selectedCycle.repsPerSet}
                </span>
                <span class="text-sm text-surface-500 dark:text-surface-400">
                  {$_('log.reps')}
                </span>
              {/if}
            </div>
          </ProgressRing>

          {#if !isComplete}
            <div
              class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
              style="background: radial-gradient(circle, {selectedExercise.color}20 0%, transparent 70%);"
            />
          {/if}
        </button>

        <!-- Set counter -->
        <div class="mt-6 text-center">
          {#if isComplete}
            <p class="font-display font-semibold text-xl text-green-600 dark:text-green-400">
              {$_('log.allDone')}
            </p>
          {:else}
            <p class="text-surface-500 dark:text-surface-400">
              {$_('log.setNumber', { values: { number: nextSetNumber } })} / {totalSets}
            </p>
            <p class="text-sm text-surface-400 dark:text-surface-500 mt-1">
              {$_('home.setsCompleted', { values: { count: completedSets, total: totalSets } })}
            </p>
          {/if}
        </div>
      </div>

      <!-- Today's sets list -->
      {#if exerciseSets.length > 0}
        <section>
          <h2 class="section-header">{$_('log.todaySets')}</h2>
          <div class="space-y-2">
            {#each exerciseSets as set, i (set.id)}
              <button class="w-full card p-4 text-left hover:shadow-soft transition-all" on:click={() => openEdit(set)}>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white"
                      style="background-color: {selectedExercise.color};"
                    >
                      {exerciseSets.length - i}
                    </span>
                    <div>
                      <p class="font-medium text-surface-900 dark:text-surface-900">
                        {set.repsCompleted}
                        {$_('log.reps')}
                      </p>
                      {#if set.notes}
                        <p class="text-xs text-surface-500 dark:text-surface-400 truncate max-w-[200px]">
                          {set.notes}
                        </p>
                      {/if}
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-surface-500 dark:text-surface-400">
                      {formatTime(set.completedAt)}
                    </p>
                    {#if set.editedAt}
                      <p class="text-xs text-surface-400 dark:text-surface-500">
                        ({$_('common.edit')})
                      </p>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        </section>
      {:else}
        <div class="text-center py-8 text-surface-400 dark:text-surface-500">
          <p>{$_('log.noSets')}</p>
        </div>
      {/if}
    {/if}
  {/if}
</div>

<!-- Edit Modal -->
<Modal
  bind:open={showEditModal}
  title={$_('log.editTime')}
  on:close={() => {
    showEditModal = false
    editingSet = null
  }}
>
  <form class="space-y-4" on:submit|preventDefault={saveEdit}>
    <div>
      <label for="edit-time" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('log.editTime')}
      </label>
      <input id="edit-time" type="time" class="input" bind:value={editTime} />
    </div>

    <div>
      <label for="edit-notes" class="block text-sm font-medium text-surface-700 dark:text-surface-700 mb-2">
        {$_('log.notes')}
      </label>
      <textarea
        id="edit-notes"
        class="input min-h-[80px] resize-none"
        bind:value={editNotes}
        placeholder={$_('log.notes')}
      />
    </div>
  </form>

  <svelte:fragment slot="footer">
    <div class="flex gap-3">
      <button class="btn btn-ghost btn-md text-red-500" on:click={deleteSet}>
        {$_('common.delete')}
      </button>
      <div class="flex-1" />
      <button
        class="btn btn-secondary btn-md"
        on:click={() => {
          showEditModal = false
          editingSet = null
        }}
      >
        {$_('common.cancel')}
      </button>
      <button class="btn btn-primary btn-md" on:click={saveEdit}>
        {$_('common.save')}
      </button>
    </div>
  </svelte:fragment>
</Modal>
