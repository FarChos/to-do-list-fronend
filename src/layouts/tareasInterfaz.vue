<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import tareaBloque from '../components/tarea.vue';
import formularioTarea from '../components/formularioNuevaTarea.vue';
import { Tarea } from "../utils/tipos";
import { tomarTareas } from "../utils/peticiones";
import { useTemaStore, useFiltroStore } from "../stores/estadoGlobal";

const temaStore = useTemaStore();
const filtroStore = useFiltroStore();
const tareas = ref<Tarea[]>([]);
const mostrarFormulario = ref(false);

const toggleFormulario = () => {
  mostrarFormulario.value = !mostrarFormulario.value;
};
const cargarTareas = async () => {
  try {
    const response = await tomarTareas();
    tareas.value = response || []; // Aseguramos que sea un array válido
    console.log("Tareas recargadas:", tareas.value);
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
  }
};

onMounted(() => {
  cargarTareas();
  const temaGuardado = localStorage.getItem("tema");
  temaStore.cambiarTema(temaGuardado === "light" || temaGuardado === "dark" ? temaGuardado : "dark");
});
// ✅ Computed para filtrar tareas 
const tareasFiltradas = computed(() => {
  return tareas.value.filter(tarea => {
    if (filtroStore.filtro === "todas") return true;
    console.log("oyeme!! esto es un filtro")
    return tarea.completed === (filtroStore.filtro === "completadas");
  });
});

const eliminarTareaDOM = (tareaId: number) => {
    tareas.value = tareas.value.filter(tarea => tarea.id !== tareaId)
};

// ✅ Agregar tarea y recargar lista automáticamente
const agregarTarea = async (nuevaTarea : Tarea) => {
  try {
    if (nuevaTarea) {
      tareas.value.push(nuevaTarea); // Se agrega directamente sin recargar la API
      mostrarFormulario.value = false; // Cierra el formulario después de agregar
      console.log("Tarea agregada:", nuevaTarea);
    }
  } catch (error) {
    console.error("Error al agregar tarea:", error);
  }
};

// ✅ Actualizar estado sin recargar
const actualizarEstadoTarea = (tareaActualizada: Tarea) => {
  const index = tareas.value.findIndex(t => t.id === tareaActualizada.id);
  if (index !== -1) {
    tareas.value[index] = tareaActualizada;
  }
};


// 📌 Funcionalidad Drag and Drop
const onDragStart = (event: DragEvent, tareaId: number) => {
  event.dataTransfer?.setData("text/plain", tareaId.toString());
};

const onDrop = (event: DragEvent, targetTarea: Tarea) => {
  const draggedItemId = event.dataTransfer?.getData("text/plain");
  if (!draggedItemId) return;

  const draggedIndex = tareas.value.findIndex(t => t.id.toString() === draggedItemId);
  const targetIndex = tareas.value.findIndex(t => t.id === targetTarea.id);

  if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
    const movedTask = tareas.value.splice(draggedIndex, 1)[0];
    tareas.value.splice(targetIndex, 0, movedTask);
    tareas.value = [...tareas.value]; // Forzar reactividad en Vue
  }
};

const cambiarTema = () => {
  const nuevoTema = temaStore.tema === "light" ? "dark" : "light";
  temaStore.cambiarTema(nuevoTema);
  localStorage.setItem("tema", nuevoTema);
};
</script>

<template>
  <div class="flex flex-row justify-center items-center h-20 text-center"
    :class="temaStore.tema === 'light' ? 'bg-amber-100' : 'bg-slate-800'">
    <h1 class="text-6xl font-mono"
      :class="temaStore.tema === 'light' ? 'text-amber-800' : 'text-slate-100'">
      Lista de tareas
    </h1>
    <button @click="cambiarTema"
      class="p-2 rounded shadow ml-5 h-10"
      :class="temaStore.tema === 'light' ? 'text-amber-600 bg-amber-50 hover:bg-amber-200' : 'text-slate-50 bg-slate-900 hover:bg-slate-700'">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>

    </button>
  </div>

  <div class="flex justify-center bg-amber-200 h-12" 
    :class="temaStore.tema === 'light' ? 'bg-amber-200' : 'bg-slate-700'">
    <nav class="flex justify-center items-center gap-6 w-1/3">
      <button @click="filtroStore.cambiarFiltro('todas')" class="font-mono font-bold text-lg rounded border-2 h-5/6 w-2/6"
      :class="temaStore.tema === 'light' ? 'bg-amber-100 border-amber-900 text-amber-900 active:text-amber-100 active:bg-amber-900 active:border-amber-50' : 'border-slate-50 text-slate-50 bg-slate-800 active:text-slate-800 active:bg-slate-50 active:border-slate-800'"
      >TODAS</button>
      <button @click="filtroStore.cambiarFiltro('incompletas')" class="font-mono font-bold text-lg rounded border-2 h-5/6 w-2/6"
      :class="temaStore.tema === 'light' ? 'bg-amber-100 border-amber-900 text-amber-900 active:text-amber-100 active:bg-amber-900 active:border-amber-50' : 'border-slate-50 text-slate-50 bg-slate-800 active:text-slate-800 active:bg-slate-50 active:border-slate-800'">INCOMPLETAS</button>
      <button @click="filtroStore.cambiarFiltro('completadas')" class="font-mono font-bold text-lg rounded border-2 h-5/6 w-2/6"
      :class="temaStore.tema === 'light' ? 'bg-amber-100 border-amber-900 text-amber-900 active:text-amber-100 active:bg-amber-900 active:border-amber-50' : 'border-slate-50 text-slate-50 bg-slate-800 active:text-slate-800 active:bg-slate-50 active:border-slate-800'">COMPLETAS</button>
    </nav>
  </div>

  <div class="flex flex-col items-center p-5 h-full gap-4"
    :class="temaStore.tema === 'light' ? 'bg-amber-400' : 'bg-slate-500'">
    <button v-if="!mostrarFormulario" @click="toggleFormulario" 
        class="rounded font-mono p-2 hover:scale-105  transition-transform duration-300 "
        :class="temaStore.tema === 'light' ? 'bg-amber-800 text-amber-100 hover:bg-amber-900' : 'bg-slate-200 text-slate-800 hover:bg-slate-50'"
    >
      Agregar nueva tarea
    </button>
    <formularioTarea v-if="mostrarFormulario" @cerrar="toggleFormulario" @agregarTarea="agregarTarea" />

    <!-- Lista de tareas con Drag and Drop -->
    <div v-if="tareasFiltradas.length > 0" class="w-full max-w-3xl p-4">
      <div v-for="tarea in tareasFiltradas" :key="tarea.id"
        draggable="true"
        @dragstart="(event) => onDragStart(event, tarea.id)"
        @dragover.prevent
        @drop="(event) => onDrop(event, tarea)"
        class="tarea-container">
        <tareaBloque 
          :tarea="tarea"
          @cambiarEstado="actualizarEstadoTarea" 
          @eliminarTarea="eliminarTareaDOM"
        />
      </div>
    </div>


    <p v-else class="text-center text-lg font-mono mt-6"
      :class="temaStore.tema === 'light' ? 'text-gray-800' : 'text-gray-300'">
      No hay tareas disponibles.
    </p>
  </div>
</template>

<style scoped>
.boton-filtro {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  transition: background 0.3s, color 0.3s;
}

.boton-filtro:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tarea-container {
  width: 90%;
  max-width: 900px;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 8px;
  transition: transform 0.2s;
}

.tarea-container:hover {
  transform: scale(1.02);
}

/* Estilos para la edición de tarea */
textarea {
  width: 100%;
  resize: none;
  border-radius: 8px;
  padding: 5px;
  font-size: 16px;
  
}

textarea:focus {
  outline: 2px solid #007BFF;
  background: #f5f5f5;
}
</style>