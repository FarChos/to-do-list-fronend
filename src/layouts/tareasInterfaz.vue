<script setup lang="ts">
import { ref, onMounted, computed, provide } from "vue";
import tareaBloque from '../components/tarea.vue';
import formularioTarea from '../components/formularioNuevaTarea.vue';
import { Tarea } from "../utils/tipos";
import { tomarTareas, guardarTarea, eliminarTarea } from "../utils/peticiones";
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
// ✅ Computed para filtrar tareas sin errores
const tareasFiltradas = computed(() => {
  return tareas.value.filter(tarea => {
    if (filtroStore.filtro === "todas") return true;
    return tarea.completed === (filtroStore.filtro === "completadas");
  });
});


// ✅ Agregar tarea y recargar lista automáticamente
const agregarTarea = async (titulo: string, descripcion: string) => {
  try {
    const nuevaTarea = await guardarTarea(titulo, descripcion);
    if (nuevaTarea) {
      tareas.value.push(nuevaTarea); // Se agrega directamente sin recargar la API
      mostrarFormulario.value = false; // Cierra el formulario después de agregar
      console.log("Tarea agregada:", nuevaTarea);
    }
  } catch (error) {
    console.error("Error al agregar tarea:", error);
  }
};



const eliminarTareaDeLista = async (tareaId: number) => {
  try {
    const status = await eliminarTarea(tareaId);
    if (status === 200 || status === 204) {
      tareas.value = tareas.value.filter(tarea => tarea.id !== tareaId);
      console.log("Tarea eliminada, lista actualizada.");
    }
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
  }
};



provide("tareasInterfazRef", { eliminarTareaDeLista });

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
  <div class="flex flex-row justify-center h-20 text-center"
    :class="temaStore.tema === 'light' ? 'bg-amber-100' : 'bg-slate-800'">
    <h1 class="text-6xl font-mono"
      :class="temaStore.tema === 'light' ? 'text-amber-800' : 'text-slate-100'">
      Lista de tareas
    </h1>
    <button @click="cambiarTema"
      class="p-2 rounded shadow ml-5"
      :class="temaStore.tema === 'light' ? 'text-amber-600 bg-amber-50 hover:bg-amber-200' : 'text-slate-50 bg-slate-900 hover:bg-slate-700'">
      Cambiar Tema
    </button>
  </div>

  <div class="flex justify-center bg-amber-200 h-12" 
    :class="temaStore.tema === 'light' ? 'bg-amber-200' : 'bg-slate-700'">
    <nav class="flex justify-center items-center gap-6 w-1/3">
      <button @click="filtroStore.cambiarFiltro('todas')" class="boton-filtro">TODAS</button>
      <button @click="filtroStore.cambiarFiltro('incompletas')" class="boton-filtro">INCOMPLETAS</button>
      <button @click="filtroStore.cambiarFiltro('completadas')" class="boton-filtro">COMPLETAS</button>
    </nav>
  </div>

  <div class="flex flex-col items-center p-5 h-full gap-4"
    :class="temaStore.tema === 'light' ? 'bg-amber-400' : 'bg-slate-500'">
    <button v-if="!mostrarFormulario" @click="toggleFormulario" class="boton-agregar">
      Agregar nueva tarea
    </button>
    <formularioTarea v-if="mostrarFormulario" @cerrar="toggleFormulario" @nuevaTarea="agregarTarea" />

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
          @actualizarLista="eliminarTareaDeLista" 
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

.boton-agregar {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 10px;
  background: #007BFF;
  color: white;
  transition: background 0.3s;
}

.boton-agregar:hover {
  background: #0056b3;
}

.tarea-container {
  width: 90%;
  max-width: 600px;
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