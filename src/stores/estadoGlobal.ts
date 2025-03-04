import { defineStore } from "pinia";

export const useTemaStore = defineStore("tema", {
  state: () => ({
    tema: "light"
  }),
  actions: {
    cambiarTema(nuevoTema: "light" | "dark") {
      this.tema = nuevoTema;
    }
  },
});

export const useFiltroStore = defineStore("filtro", {
  state: () => ({
    filtro: "todas" as "todas" | "completadas" | "incompletas", // Tipado explícito
  }),
  actions: {
    cambiarFiltro(nuevoFiltro: "todas" | "completadas" | "incompletas") {
      this.filtro = nuevoFiltro;
    },
  },
});
