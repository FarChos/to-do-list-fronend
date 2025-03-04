import { backend } from "./axios";
import { Tarea } from "./tipos"; // Importa el tipo si está en otro archivo

// Guardar una tarea (POST)
export const guardarTarea = async (titulo: string, descripcion: string) => {
  try {
    const response = await fetch("http://localhost:3000/tareas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ titulo, descripcion, completed: false })
    });

    if (!response.ok) throw new Error("Error al guardar la tarea");

    return await response.json(); // Devuelve la tarea creada en lugar de solo `200`
  } catch (error) {
    console.error("Error en guardarTarea:", error);
    return null;
  }
};


export async function tomarTareas(): Promise<Tarea[]> {
    try {
        const response = await backend.get<Tarea[]>("/tareas"); // Le decimos a Axios qué tipo de datos esperar
        return response.data; // Ahora TypeScript sabe que response.data es un array de Tarea
    } catch (error) {
        console.error("Error al tomar las tareas:", error);
        throw error;
    }
}

// Eliminar una tarea (DELETE)
export const eliminarTarea = async (id: number) => {
  try {
    const response = await fetch(`/tareas/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text(); // Captura el error real del backend
      throw new Error(`Error al eliminar la tarea: ${errorText}`);
    }
    
    return response.status;
  } catch (error) {
    console.error("Error en eliminarTarea:", error);
    return 500;
  }
};


// Actualizar una tarea (PATCH)
export async function actualizarTarea(id: number, titulo: string, descripcion: string) {
  try {
    const response = await backend.patch(`/tareas/${id}`, { // Backticks correctos
      titulo,        // No es necesario poner comillas y `${}` dentro del objeto JSON
      descripcion
    });
    return response.status;
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    throw error;
  }
}

//  Actualizar Estado
export async function actualizarEstado(id : number, completed : boolean){
  try {
    const response = await backend.patch(`/tareas/${id}`, {
      completed,
    });
    return response.status;
  } catch (error) {
    console.error("Error al actualizar el estado:", error);
    throw error;
  }
}

