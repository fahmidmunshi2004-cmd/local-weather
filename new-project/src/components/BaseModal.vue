<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modalActive"
        @click="$emit('close')"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      >
        <div
          @click.stop
          v-bind="attrs"
          class="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 text-slate-800 shadow-[0_30px_80px_rgba(39,94,135,0.16)]"
        >
          <slot></slot>
          <div class="mt-6 flex w-full justify-end">
            <button
              @click="$emit('close')"
              type="button"
              class="inline-flex cursor-pointer items-center justify-end rounded-full border border-sky-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
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
import { useAttrs } from "vue";

defineOptions({
  inheritAttrs: false,
});

defineProps<{
  modalActive: boolean;
}>();

defineEmits<{
  close: [];
}>();

const attrs = useAttrs();
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
