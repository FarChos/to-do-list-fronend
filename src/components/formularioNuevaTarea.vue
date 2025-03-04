<script setup lang="ts">
import { defineEmits, ref } from "vue";
import { guardarTarea } from "../utils/peticiones";
import { useToast } from "vue-toastification";
import { useTemaStore } from "../stores/estadoGlobal";

const toast = useToast();
const temaStore = useTemaStore();
const emit = defineEmits(["cerrar", "nuevaTarea"]);

const descripcion = ref("");
const titulo = ref("");

const guardar = async () => {
  try {
    if (!titulo.value.trim()) {
      toast.error("El título es obligatorio.");
      return;
    }

    const nuevaTarea = await guardarTarea(titulo.value, descripcion.value || "");

    if (nuevaTarea) { // Si la API devuelve la tarea creada correctamente
      toast.success("Tarea guardada con éxito!");
      
      // Emitir evento para agregar la tarea a la lista en tiempo real
      emit("nuevaTarea", nuevaTarea);
      emit("cerrar");

      // Limpiar el formulario
      titulo.value = "";
      descripcion.value = "";
    } else {
      toast.error("Error al guardar la tarea.");
    }
  } catch (error) {
    console.error("Error al guardar la tarea:", error);
    toast.error("Error en la conexión con el servidor.");
  }
};
</script>

<template>
    <form @submit.prevent="guardar">
        <div class="flex flex-row gap-4">
            <h2 class="font-mono text-xl"
                :class="temaStore.tema === 'light' ? 'text-amber-700' : 'text-slate-200'">
                Agrega una nueva tarea
            </h2>
            <button 
                type="button"
                class="flex items-center gap-2 p-2 rounded shadow"
                :class="temaStore.tema === 'light' ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-slate-300 bg-slate-800 hover:bg-slate-700'"
                @click="emit('cerrar')"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="flex flex-col gap-2">
            <label for="titulo"></label>
            <input v-model="titulo" id="titulo" class="h-10 p-2 font-mono rounded-md text-xl border-2" type="text"
                placeholder="Titulo de la tarea" required
                :class="temaStore.tema === 'light' 
                    ? 'bg-amber-200 placeholder-amber-700 text-amber-700 border-amber-700' 
                    : 'bg-slate-700 placeholder-slate-200 text-slate-200 border-slate-200'"
            >

            <label for="descripcion"></label>
            <textarea v-model="descripcion" id="descripcion" class="p-2 font-mono border-2" placeholder="Descripción de la tarea"
                :class="temaStore.tema === 'light' 
                    ? 'placeholder-amber-700 text-amber-700 border-amber-700 bg-amber-100 hover:bg-amber-200' 
                    : 'placeholder-slate-200 text-slate-200 border-slate-200 bg-slate-800 hover:bg-slate-700'">
            </textarea>

            <button class="font-mono rounded-md h-10 text-xl border-2" type="submit"
                :class="temaStore.tema === 'light' 
                    ? 'bg-amber-700 text-amber-200 border-amber-200 active:bg-amber-200 active:text-amber-700 active:border-amber-700' 
                    : 'bg-slate-200 text-slate-700 border-slate-700 active:bg-slate-700 active:text-slate-200 active:border-slate-200'">
                Agregar
            </button>
        </div>
    </form>
</template>
