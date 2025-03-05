<script setup lang="ts">
import { ref, watch, inject } from "vue";
import { Tarea } from "../utils/tipos";
import { eliminarTarea, actualizarTarea, actualizarEstado } from "../utils/peticiones";
import { useToast } from "vue-toastification";
import { useTemaStore } from "../stores/estadoGlobal";

const temaStore = useTemaStore()
const tareasInterfazRef = inject<{ eliminarTareaDeLista: (id: number) => void }>("tareasInterfazRef");
const toast = useToast();
const props = defineProps<{ tarea: Tarea }>();
const emit = defineEmits(["cambiarEstado", "actualizarLista", "eliminarTarea"]);

const editando = ref(false);
const tituloTemporal = ref(props.tarea.titulo);
const descripcionTemporal = ref(props.tarea.descripcion);
const estado = ref(props.tarea.completed);

watch(() => props.tarea, (nuevaTarea) => {
  tituloTemporal.value = nuevaTarea.titulo;
  descripcionTemporal.value = nuevaTarea.descripcion;
  estado.value = nuevaTarea.completed;
}, { deep: true });

const borrar = async () => {
  try {
    const status = await eliminarTarea(props.tarea.id);
    if (status === 200 || status === 204) {
      tareasInterfazRef?.eliminarTareaDeLista(props.tarea.id);
      emit('eliminarTarea', props.tarea.id); 
      toast.success("Tarea eliminada correctamente");
    } else {
      throw new Error("Error al eliminar la tarea");
    }
  } catch (error) {
    console.error("No se pudo eliminar la tarea.", error);
    toast.error("Error al eliminar la tarea");
  }
};

const activarEdicion = () => {
  editando.value = true;
};

const guardarEdicion = async () => {
  try {
    const respuesta = await actualizarTarea(props.tarea.id, tituloTemporal.value, descripcionTemporal.value);
    if (respuesta === 200) {
      toast.success("Tarea actualizada");
      editando.value = false;
      emit("actualizarLista");
    } else {
      throw new Error("Error al actualizar la tarea");
    }
  } catch (error) {
    console.error("Error en la actualización", error);
    toast.error("Error al actualizar la tarea");
  }
};

const GuardarEstado = async () => {
  try {
    const respuesta = await actualizarEstado(props.tarea.id, estado.value);
    if (respuesta === 200) {
      toast.success("Estado actualizado");
      emit("cambiarEstado", { ...props.tarea, completed: estado.value });
      emit("actualizarLista");
    } else {
      throw new Error("Error al actualizar estado");
    }
  } catch (error) {
    console.error("Error al actualizar el estado", error);
    toast.error("Error al actualizar estado");
  }
};
</script>

<template>
  <div class="flex flex-row scale-100 rounded items-center p-2 gap-2 justify-around"
  :class="temaStore.tema === 'light' ? 'bg-amber-100' : 'bg-slate-800'">
    <div @dblclick="activarEdicion">
      <span
      class="font-mono "  
      :class="temaStore.tema === 'light' ? 'text-amber-900' : 'text-slate-100' "
      v-if="!editando">{{ tituloTemporal }}</span>
      <input
      class="font-mono"
      :class="temaStore.tema === 'light' ? 'text-amber-900 ' : 'text-slate-800'"
      v-else v-model="tituloTemporal" @blur="guardarEdicion" />
    </div>

    <div @dblclick="activarEdicion">
      <span 
      class="font-mono "
      :class="temaStore.tema === 'light' ? 'text-amber-900 ' : 'text-slate-100'"
      v-if="!editando">{{ descripcionTemporal }}</span>
      <textarea
      class="font-mono"
      :class="temaStore.tema === 'light' ? 'text-amber-800' : 'text-slate-800'"
      v-else v-model="descripcionTemporal" @blur="guardarEdicion"></textarea>
    </div>

    <input class="h-5/6" type="checkbox" v-model="estado" @change="GuardarEstado" />

    <button @click="guardarEdicion"
    class="p-2 rounded shadow ml-5 h-5/6"
    :class="temaStore.tema === 'light' ? 'text-amber-600 bg-amber-200 hover:bg-amber-300' : 'text-slate-50 bg-slate-900 hover:bg-slate-700'"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
      </svg>

    </button>
    <button 
    class="p-2 rounded shadow ml-5 h-5/6"
    :class="temaStore.tema === 'light' ? 'text-amber-600 bg-amber-200 hover:bg-amber-300' : 'text-slate-50 bg-slate-900 hover:bg-slate-700'"
    @click="borrar"
    >
      
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>

    </button>
  </div>
</template>


<style scoped>

.tarea {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f5f5;
  transition: 0.3s;
}
.tarea:hover {
  transform: scale(1.02);
}
input,
textarea {
  padding: 5px;
  border-radius: 5px;
}
button {
  cursor: pointer;
}
</style>
