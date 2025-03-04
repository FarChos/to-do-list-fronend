// utils/peticiones.ts - Funciones de petición corregidas
import { backend } from "./axios";
import { Tarea } from "./tipos";

// Guardar una tarea (POST)
export const guardarTarea = async (titulo: string, descripcion: string) => {
  try {
    const response = await backend.post<Tarea>("/tareas", {
      titulo,
      descripcion,
      completed: false,
    });
    return response.data;
  } catch (error) {
    console.error("Error en guardarTarea:", error);
    return null;
  }
};

// Obtener tareas (GET)
export async function tomarTareas(): Promise<Tarea[]> {
  try {
    const response = await backend.get<Tarea[]>("/tareas");
    return response.data;
  } catch (error) {
    console.error("Error al tomar las tareas:", error);
    throw error;
  }
}

// Eliminar una tarea (DELETE)
export const eliminarTarea = async (id: number) => {
  try {
    const response = await backend.delete(`tareas/${id}`); // ✅ Corrección aquí
    if (response.status === 200 || response.status === 204) {
      return response.status;
    } else {
      throw new Error("Error al eliminar la tarea");
    }
  } catch (error) {
    console.error("Error en eliminarTarea:", error);
    return 500;
  }
};

// Actualizar una tarea (PATCH)
export async function actualizarTarea(id: number, titulo: string, descripcion: string) {
  try {
    const response = await backend.patch(`tareas/${id}`, { // ✅ Corrección aquí
      titulo,
      descripcion,
    });
    if (response.status === 200) {
      return response.status;
    } else {
      throw new Error("Error al actualizar la tarea");
    }
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    throw error;
  }
}

// Actualizar estado de tarea (PATCH)
export async function actualizarEstado(id: number, completed: boolean) {
  try {
    const response = await backend.patch(`tareas/${id}`, { // ✅ Corrección aquí
      completed,
    });
    if (response.status === 200) {
      return response.status;
    } else {
      throw new Error("Error al actualizar el estado");
    }
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    throw error;
  }
}