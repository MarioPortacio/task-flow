# 📋 TaskFlow

**TaskFlow** es una aplicación de gestión de tareas y organización visual construida con **Angular**, diseñada para ser ligera, rápida y totalmente privada. A diferencia de otras herramientas, TaskFlow permite el control total de los datos mediante la exportación e importación de archivos `.tflow`.


![Angular](https://img.shields.io/badge/Angular-17+-dd0031.svg?logo=angular)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38bdf8.svg?logo=tailwind-css)

---

## ✨ Características Principales

* **🗂️ Organización por Carriles:** Sistema de matriz de matrices que permite agrupar columnas en carriles lógicos.
* **💾 Formato .tflow:** Guarda y carga tus tableros localmente. Tus datos nunca salen de tu computadora.
* **🎨 Personalización Total:** Cambia colores de columnas, ajusta anchos mediante *resizing* y define prioridades.
* **⚡ Plantillas Predefinidas:** Inicia proyectos rápidamente con estructuras predefinidas para Desarrollo de Software, Marketing o Gestión Personal.
* **🌓 Modo Oscuro:** Interfaz adaptativa que protege tu vista durante largas sesiones de trabajo.
* **🎯 Drag & Drop:** Experiencia fluida para mover tareas y reordenar columnas mediante Angular CDK.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [Angular](https://angular.io/) (v17+)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Interactividad:** [Angular CDK](https://material.angular.io/cdk/) (Drag & Drop)
* **Iconos:** SVG Dinámicos (Heroicons)
* **Persistencia:** LocalStorage API & File System

---

## 🔧 Instalación y Desarrollo

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/MarioPortacio/task-flow.git](https://github.com/MarioPortacio/task-flow.git)
    cd task-flow
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecuta el servidor de desarrollo:**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`.

---

## 📖 Cómo usar TaskFlow

1.  **Crear:** Inicia desde cero o usa una **Plantilla** para ahorrar tiempo.
2.  **Gestionar:** Añade tareas, dales una descripción y define su prioridad (Baja, Media, Alta).
3.  **Organizar:** Arrastra y suelta tareas entre columnas o cambia el orden de los carriles.
4.  **Guardar:** Exporta tu trabajo como un archivo `.tflow`. El indicador de círculo naranja te avisará si tienes cambios sin guardar.
5.  **Cargar:** Usa el botón de **Importar** en la página de inicio para retomar un proyecto anterior.

---

## 📈 Posibles Mejoras Futuras

* **Sincronización en la Nube:** Opción para conectar con Firebase o Supabase para sincronizar tableros entre múltiples dispositivos.
* **Subtareas:** Implementar un sistema de "Checklist" dentro de cada tarjeta para desglosar tareas complejas.
* **Fechas de Vencimiento:** Añadir un selector de fechas con alertas visuales cuando una tarea esté próxima a vencer.
* **Buscador Global:** Un filtro rápido para encontrar tareas por texto, etiqueta de prioridad o descripción en tableros extensos.
* **Archivo Adjunto:** Permitir adjuntar imágenes o documentos pequeños codificados en Base64 dentro del archivo `.tflow`.
* **Historial de Cambios (Undo/Redo):** Implementar un sistema de comandos para deshacer acciones accidentales.
* **Colaboración en Tiempo Real:** Integración de WebSockets para que múltiples usuarios puedan editar el mismo tablero simultáneamente.
* **Modo Estadísticas:** Un panel visual para ver cuántas tareas se han completado por carril o prioridad (Diagramas de Burn-down).

