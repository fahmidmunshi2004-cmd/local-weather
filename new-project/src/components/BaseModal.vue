<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalActive"
        @click="$emit('close')"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      >
        <div
          @click.stop
          class="w-full max-w-lg rounded-[28px] border border-white/20 bg-white/12 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
        >
          <slot></slot>
          <div class="mt-6 flex w-full justify-end">
            <button
              @click="$emit('close')"
              type="button"
              class="inline-flex cursor-pointer items-center justify-end rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modalActive: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
