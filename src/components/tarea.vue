<script setup lang="ts">
import { ref, watch, inject } from "vue";
import { Tarea } from "../utils/tipos";
import { eliminarTarea, actualizarTarea, actualizarEstado } from "../utils/peticiones";
import { useToast } from "vue-toastification";

const tareasInterfazRef = inject<{ eliminarTareaDeLista: (id: number) => void }>("tareasInterfazRef");
const toast = useToast();
const props = defineProps<{ tarea: Tarea }>();
const emit = defineEmits(["cambiarEstado", "actualizarLista"]);

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
  const status = await eliminarTarea(props.tarea.id);
  if (status === 200 || status === 204) {
    tareasInterfazRef?.eliminarTareaDeLista(props.tarea.id);
    emit("actualizarLista");
  } else {
    console.error("No se pudo eliminar la tarea.");
  }
};

const activarEdicion = () => {
  editando.value = true;
};

const guardarEdicion = async () => {
  try {
    const respuesta = await actualizarTarea(props.tarea.id, tituloTemporal.value, descripcionTemporal.value);
    if (typeof respuesta === "number" && respuesta === 200) {
      toast.success("Tarea actualizada");
      editando.value = false;
      emit("actualizarLista");
    } else {
      toast.error("Error al actualizar");
    }
  } catch {
    toast.error("Error en la conexión");
  }
};

const GuardarEstado = async () => {
  try {
    const respuesta = await actualizarEstado(props.tarea.id, estado.value);
    if (typeof respuesta === "number" && respuesta === 200) {
      toast.success("Estado actualizado");
      emit("cambiarEstado", { ...props.tarea, completed: estado.value });
      emit("actualizarLista");
    } else {
      toast.error("Error al actualizar estado");
    }
  } catch {
    toast.error("Error en la conexión");
  }
};
</script>


<template>
  <div class="tarea">
    <div @dblclick="activarEdicion">
      <span v-if="!editando">{{ tituloTemporal }}</span>
      <input v-else v-model="tituloTemporal" @blur="guardarEdicion" />
    </div>

    <div @dblclick="activarEdicion">
      <span v-if="!editando">{{ descripcionTemporal }}</span>
      <textarea v-else v-model="descripcionTemporal" @blur="guardarEdicion"></textarea>
    </div>

    <input type="checkbox" v-model="estado" @change="GuardarEstado" />

    <button @click="guardarEdicion">Guardar</button>
    <button @click="borrar">Eliminar</button>
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
