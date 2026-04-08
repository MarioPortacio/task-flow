import { Component, OnInit, Inject, PLATFORM_ID, HostListener, ViewChild, ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { OnboardingComponent } from './shared/onboarding/onboarding';
import { Task } from './core/models/task.model';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

interface ColumnConfig {
  id: string;
  name: string;
  color: string;
  tasks: string[];
  width?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [CommonModule, RouterOutlet, OnboardingComponent, DragDropModule, FormsModule],
  imports: [CommonModule, RouterOutlet, DragDropModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'TaskFlow';
  private isBrowser: boolean;

  newTask = {
    title: '',
    description: '',
    priority: 'medium'
  };

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority: 'low' | 'medium' | 'high' = 'low';
  isDarkMode = false;
  showHelp = false;
  selectedColumnId: string = '';
  isResizing = false;
  availableColors = ['amber', 'blue', 'emerald', 'rose', 'purple', 'indigo', 'cyan', 'orange'];
  currentView: 'home' | 'board' | 'config' = 'home';
  resizingColumn: { lane: number, col: number } | null = null;
  // Para rastrear qué tarea estamos editando y en qué campo
  editingTaskId: string | null = null;
  isHeaderVisible: boolean = true;
  editingColumnId: string | null = null;

  // Variables de control de archivo
  currentFileName: string | null = null;
  hasUnsavedChanges: boolean = false;
  showTemplateModal: boolean = false;

  priorities = [
  { id: 'low', label: 'Baja', class: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { id: 'medium', label: 'Media', class: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { id: 'high', label: 'Alta', class: 'bg-rose-500/20 text-rose-600 dark:text-rose-400' }
];

  // Mantenemos una sola fuente de verdad: LANES
  // lanes: ColumnConfig[][] = [ [], [], [] ];
  lanes: any[][] = [];

  // Datos de respaldo para la primera vez
  columns: ColumnConfig[] = [
    { id: 'todo', name: 'Pendiente', color: 'amber', tasks: ['Hacer café', 'Revisar email'], width: 320 },
    { id: 'doing', name: 'En Proceso', color: 'blue', tasks: ['Programar Angular'], width: 320 },
    { id: 'done', name: 'Hecho', color: 'emerald', tasks: ['Aprender Tailwind'], width: 320 }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadAllData();
    if (this.isBrowser) {
      const savedDark = localStorage.getItem('darkMode');
      if (savedDark) {
        this.isDarkMode = JSON.parse(savedDark);
        if (this.isDarkMode) document.documentElement.classList.add('dark');
      }
    }
  }

  // --- PERSISTENCIA UNIFICADA ---
  saveTasks() {
    if (this.isBrowser) {
      localStorage.setItem('taskflow_lanes', JSON.stringify(this.lanes));
      localStorage.setItem('taskflow_onboarding_help', JSON.stringify(this.showHelp));
    }
  }

  loadAllData() {
    if (this.isBrowser) {
      const savedLanes = localStorage.getItem('taskflow_lanes');
      if (savedLanes) {
        this.lanes = JSON.parse(savedLanes);
      } else {
        // Si no hay nada guardado, repartimos las columnas iniciales en los carriles
        this.columns.forEach((col, index) => {
          this.lanes[index % 3].push(col);
        });
      }
      
      const savedHelp = localStorage.getItem('taskflow_onboarding_help');
      if (savedHelp) this.showHelp = JSON.parse(savedHelp);
    }
  }

  // --- LÓGICA DE INTERFAZ ---
  goToBoard() { this.currentView = 'board'; }
  goHome() { this.currentView = 'home'; }
  goToConfig() {
    // Aplanamos los carriles para obtener la lista simple de columnas y poder editarlas
    this.columns = this.lanes.flat();
    this.currentView = 'config';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isBrowser) {
      document.documentElement.classList.toggle('dark', this.isDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    }
  }

  // toggleHelp() {
  //   this.showHelp = !this.showHelp;
  //   this.cdr.detectChanges(); // Forzamos el refresco visual
  // }

  toggleHelp() {
    console.log('Estado previo help:', this.showHelp); // Para ver en consola
    this.showHelp = !this.showHelp;
    console.log('Estado nuevo help:', this.showHelp);
    
    // Esto es vital para que Angular reaccione
    this.cdr.detectChanges(); 
  }


  toggleHeader() {
    this.isHeaderVisible = !this.isHeaderVisible;
  }


  // 2. ELIMINAR COLUMNA
  deleteColumn(laneIndex: number, colIndex: number) {
    if (confirm('¿Estás seguro de eliminar esta columna y todas sus tareas?')) {
      this.lanes[laneIndex].splice(colIndex, 1);
      this.saveTasks();
      this.markAsDirty();
    }
  }

  

  deleteColumnConfig(index: number) {
    this.columns.splice(index, 1);
    this.markAsDirty();
  }
  

  // addColumnConfig() {
  //   const newId = 'col-' + Date.now();
  //   this.columns.push({ id: newId, name: 'Nueva Columna', color: 'blue', tasks: [] });
  // }

  addColumnConfig() {
    this.columns.push({
      id: 'col-' + Date.now(),
      name: 'Nueva Columna',
      color: 'blue',
      tasks: [],
      width: 300
    });
  }

  addColumn(laneIndex: number = 0) {
    const newCol = {
      id: 'col-' + Date.now(),
      name: 'Nueva Columna',
      tasks: [],
      color: 'blue',
      width: 300 // Ancho por defecto
    };
    this.lanes[laneIndex].push(newCol);
    this.saveTasks();
    this.markAsDirty();
  }

  // addColumn(ignoredIndex: number) {
  //   const newCol = {
  //     id: 'col-' + Date.now(),
  //     name: 'Nueva Columna',
  //     color: 'blue',
  //     width: 350,
  //     tasks: []
  //   };
  //   this.columns.push(newCol);
  // }

  // saveConfig() {
  //   // 1. Limpiamos los carriles actuales (manteniendo al menos 3)
  //   this.lanes = [[], [], []];

  //   // 2. Repartimos las columnas editadas entre los carriles
  //   this.columns.forEach((col, index) => {
  //     // Usamos el operador módulo % para repartir equitativamente
  //     const laneIndex = index % this.lanes.length;
  //     this.lanes[laneIndex].push(col);
  //   });

  //   // 3. Persistimos y volvemos al tablero
  //   this.saveTasks(); 
  //   this.currentView = 'board';
  // }

  // saveConfig() {
  //   try {
  //     // 1. Sincronizamos la estructura. 
  //     // Si tu app usa un solo carril principal, actualizamos el primer carril.
  //     if (this.lanes && this.lanes.length > 0) {
  //       this.lanes[0] = [...this.columns];
  //     } else {
  //       // Si por alguna razón lanes estaba vacío, lo inicializamos
  //       this.lanes = [[...this.columns]];
  //     }

  //     // 2. Persistencia: Guardamos en LocalStorage para no perder los cambios al recargar
  //     this.saveTasks(); 

  //     // 3. Navegación: Volvemos a la vista del tablero
  //     this.currentView = 'board';

  //     // 4. Feedback: Opcional, un log para confirmar que todo salió bien
  //     console.log('Configuración guardada exitosamente.');

  //     // Importante: Si usas ChangeDetectionStrategy.OnPush, dispara el check:
  //     this.cdr.markForCheck();
      
  //   } catch (error) {
  //     console.error('Error al guardar la configuración:', error);
  //     alert('Hubo un problema al guardar los cambios.');
  //   }
  // }


  saveConfig() {
    try {
      // 1. REESTRUCTURACIÓN DESDE CERO
      // Mapeamos cada columna configurada a un NUEVO carril.
      // Importante: Forzamos 'tasks' como un array vacío [] para ignorar cualquier tarea previa.
      this.lanes = this.columns.map(col => {
        return [
          {
            id: col.id || 'col-' + Date.now() + Math.random().toString(36).substr(2, 5),
            name: col.name,
            color: col.color || 'blue',
            width: col.width || 350,
            tasks: [] // <--- AQUÍ: Vaciamos las tareas por completo
          }
        ];
      });

      // 2. ACTUALIZACIÓN DE REFERENCIAS
      // Sincronizamos la lista plana de columnas con la nueva estructura de lanes
      this.columns = this.lanes.map(lane => lane[0]);

      // 3. PERSISTENCIA
      // Guardamos la estructura limpia en el almacenamiento local
      this.saveTasks(); 

      // 4. NAVEGACIÓN
      this.currentView = 'board';

      // 5. REFRESH
      if (this.cdr) {
        this.cdr.detectChanges();
      }

      console.log('Tablero reiniciado: Estructura generada sin tareas.');

    } catch (error) {
      console.error('Error al generar el nuevo tablero:', error);
      alert('No se pudo inicializar el tablero.');
    }
  }

  // --- MANEJO DE TAREAS ---
  // Función para añadir una tarea nueva como OBJETO
  addTask() {
    if (!this.newTask.title.trim() || !this.selectedColumnId) {
      alert("Por favor, escribe un título y selecciona una columna destino.");
      return;
    }

    // Buscamos la columna seleccionada dentro de todos los carriles
    let targetColumn: any = null;
    for (let lane of this.lanes) {
      targetColumn = lane.find((c: any) => c.id === this.selectedColumnId);
      if (targetColumn) break;
    }

    if (targetColumn) {
      targetColumn.tasks.push({
        id: Date.now().toString(),
        text: this.newTask.title.trim(),
        description: this.newTask.description.trim(),
        priority: this.newTask.priority
      });

      this.saveTasks();
      
      // Limpieza
      this.newTask = { title: '', description: '', priority: 'medium' };
      this.cdr.detectChanges();
    }

    this.markAsDirty();
  }
    

  //Borrar esta función
  migrateOldTasks() {
    this.lanes.forEach(lane => {
      lane.forEach((col: any) => {
        col.tasks = col.tasks.map((task: any) => {
          if (typeof task === 'string') {
            return { text: task, priority: 'medium', id: Math.random().toString(36) };
          }
          return task;
        });
      });
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.saveTasks();
    this.markAsDirty();
  }

  dropColumn(event: CdkDragDrop<ColumnConfig[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    
    // FORZAMOS EL RE-RENDERIZADO TRAS EL MOVIMIENTO
    this.saveTasks(); 
    this.cdr.detectChanges(); 
    this.markAsDirty();
  }

  // Añade esta pequeña función para "despertar" a Angular al empezar a arrastrar
  prepareDrag() {
    this.cdr.detectChanges();
  }

  get allColumnIds(): string[] {
    return this.lanes.flatMap(lane => lane.map(col => col.id));
  }

  // --- LÓGICA DE RESIZE (FLUIDO) ---
  initResize(event: MouseEvent, laneIdx: number, colIdx: number) {
    event.preventDefault();
    event.stopPropagation();
    
    this.isResizing = true;
    this.resizingColumn = { lane: laneIdx, col: colIdx };

    const startX = event.clientX;
    const column = this.lanes[laneIdx][colIdx];
    const startWidth = column.width || 320;

    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      // 3. Ejecutamos dentro de la zona para que el preview sea instantáneo
      this.zone.run(() => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        if (newWidth > 150 && newWidth < 1000) {
          column.width = newWidth;
          this.cdr.markForCheck(); // Avisa que hay cambios
        }
      });
    };

    const mouseUpHandler = () => {
      // 1. Ejecutamos dentro de la zona para que Angular se entere
      this.zone.run(() => {
        // 2. Usamos un timeout de 0ms para mover esto al FINAL de la cola de ejecución
        setTimeout(() => {
          this.isResizing = false;
          this.resizingColumn = null;
          
          // 3. Forzamos la detección de cambios dos veces para asegurar el renderizado
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          
          this.saveTasks();
        }, 0);
      });

      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }


  cycleColor(col: any) {
    const currentIndex = this.availableColors.indexOf(col.color || 'blue');
    const nextIndex = (currentIndex + 1) % this.availableColors.length;
    col.color = this.availableColors[nextIndex];
    this.saveTasks(); // Guardamos el nuevo color al instante
    this.markAsDirty();
  }

  cyclePriority(event: MouseEvent, task: any) {
    event.stopPropagation(); // Evita conflictos con el drag
    
    // Si la tarea aún es un string (vieja), la convertimos
    if (typeof task === 'string') return; 

    const currentIdx = this.priorities.findIndex(p => p.id === task.priority);
    const nextIdx = (currentIdx + 1) % this.priorities.length;
    task.priority = this.priorities[nextIdx].id;
    
    this.saveTasks();
    this.markAsDirty();
  }

  //para detectar clics en la pantalla
  @ViewChild('colInput') colInput?: ElementRef;
  @HostListener('document:click', ['$event'])
  handleGlobalClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // 1. Lógica para TAREAS
    if (this.editingTaskId) {
      // Si el clic NO es dentro de la tarjeta, botones o selectores
      if (!target.closest('.group\\/card') && !target.closest('button') && !target.closest('select')) {
        this.finishEdit();
        this.markAsDirty();
      }
    }

    

    // Si la ayuda está abierta y el clic NO es dentro del manual ni en el botón de ayuda
    if (this.showHelp) {
      const isClickInsideManual = target.closest('.manual-container');
      const isClickOnHelpButton = target.closest('#helpButton'); // Asegúrate de que tu botón tenga este ID

      if (!isClickInsideManual && !isClickOnHelpButton) {
        this.showHelp = false;
      }
    }



    // 2. Lógica para COLUMNAS
    if (this.editingColumnId) {
      // Usamos el ViewChild si existe, o simplemente verificamos que no sea el input
      // El chequeo con 'target.closest' suele ser más robusto para inputs dinámicos
      if (this.colInput && !this.colInput.nativeElement.contains(target)) {
        this.finishEditColumn();
      }
    }
  }




  // @HostListener('document:click', ['$event'])
  //   onClickOutside(event: MouseEvent) {
  //     const target = event.target as HTMLElement;
  //     // Si hay una edición activa y el clic NO es dentro de una tarjeta o un selector de color/prioridad
  //     if (this.editingTaskId && !target.closest('.group\\/card') && !target.closest('button') && !target.closest('select')) {
  //       this.finishEdit();
  //     }
  //   }


  // @ViewChild('colInput') colInput?: ElementRef;

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   // Si no estamos editando nada, no hacemos nada
  //   if (!this.editingColumnId) return;

  //   // Si el clic NO fue dentro del input que estamos editando
  //   if (this.colInput && !this.colInput.nativeElement.contains(event.target)) {
  //     this.finishEditColumn();
  //   }
  // }


  // Activa el modo edición
  startEdit(task: any) {
    this.editingTaskId = task.id;
    this.markAsDirty();
  }

  startEditColumn(colId: string) {
    this.editingColumnId = colId;
    this.markAsDirty();
  }

  // Finaliza la edición y guarda
  finishEdit() {
    this.editingTaskId = null;
    this.saveTasks();
    this.markAsDirty();
  }

  finishEditColumn() {
    this.editingColumnId = null;
    this.saveTasks();
  }


  cancelEdit() {
    this.editingTaskId = null;
    // Opcional: Recargar desde localStorage para deshacer cambios no guardados
    const saved = localStorage.getItem('lanes');
    if (saved) this.lanes = JSON.parse(saved);
  }

  // Detecta si el foco se movió fuera de toda la tarjeta, no solo del input
  onFocusOut(event: FocusEvent, taskId: string) {
    const target = event.relatedTarget as HTMLElement;
    // Si el nuevo elemento con foco no está dentro de la misma tarjeta, cerramos
    if (!target || !target.closest('.group\\/card')) {
      this.finishEdit();
    }
  }

  removeLane(index: number) {
    if (this.lanes.length > 1) {
      if (this.lanes[index].length > 0) {
        this.lanes[0].push(...this.lanes[index]);
      }
      this.lanes.splice(index, 1);
      this.saveTasks();
      this.markAsDirty();
    }
  }

















  // 1. EXPORTAR: Convierte tus lanes en un archivo JSON y lo descarga
  // 1. EXPORTAR con selector de ubicación y nombre (.tflow)
  async exportBoard() {
    const data = JSON.stringify(this.lanes, null, 2);
    
    try {
      // Abrir el selector de archivos del Sistema Operativo
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `mi-tablero-${new Date().toISOString().slice(0,10)}.tflow`,
        types: [{
          description: 'Archivo de Tablero TaskFlow',
          accept: { 'application/json': ['.tflow'] }
        }]
      });

      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (err) {
      console.log('Exportación cancelada o no soportada', err);
      // Fallback: Si el navegador es antiguo, usamos el método del link invisible
      if (err instanceof TypeError) { this.fallbackExport(data); }
    }
  }


  // 2. IMPORTAR con carga instantánea (sin recargar página)
  // 2. IMPORTAR: Lee el archivo seleccionado y sobreescribe el tablero
  importBoard(event: any) {
    const file = event.target.files[0];
    if (!file) return;


    // 1. CAPTURAMOS EL NOMBRE DEL ARCHIVO
    // Esto es lo que permite que el botón "Guardar" funcione después
    this.currentFileName = file.name;
    this.hasUnsavedChanges = false; // El archivo acaba de abrirse, está limpio

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedLanes = JSON.parse(e.target.result);
        
        if (Array.isArray(importedLanes)) {
          // Actualizamos los datos en memoria
          this.lanes = importedLanes;
          
          // Guardamos en LocalStorage
          this.saveTasks(); 
          
          // Forzamos a Angular a pintar los nuevos datos YA
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          
          console.log("Tablero actualizado instantáneamente");
        }
      } catch (error) {
        alert("Error: El archivo .tflow no es válido.");
      }
    };
    reader.readAsText(file);
    // Limpiamos el input para poder subir el mismo archivo otra vez si se desea
    event.target.value = '';
  }

  // Fallback por si el navegador no soporta showSaveFilePicker (Safari/Firefox antiguos)
  private fallbackExport(data: string) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tablero.tflow';
    link.click();
  }


  markAsDirty() {
    this.hasUnsavedChanges = true;
  }

  // Guardar (Save)
  // async save() {
  //   if (this.currentFileName) {
  //     // Si ya sabemos qué archivo es, guardamos directamente
  //     this.executeFileSave(this.currentFileName);
  //   } else {
  //     // Si es un archivo nuevo, se comporta como "Guardar como"
  //     this.saveAs();
  //   }
  // }


  // Función especial para el Homepage
  importAndGo(event: any) {
    // 1. Ejecutamos tu lógica de importación existente
    this.importBoard(event);
    
    // 2. Si se cargó un archivo (puedes verificar si currentFileName existe)
    if (event.target.files.length > 0) {
      // 3. Redirigimos al tablero
      this.goToBoard();
      // O la función que uses: this.goToBoard();
      
      console.log("Archivo cargado. Redirigiendo al tablero...");
    }
    this.goToBoard();
    
  }

  // openTemplates() {
  //   // Aquí podrías abrir un modal con opciones como:
  //   // "Software Dev", "Marketing", "Personal To-Do"
  //   alert("Próximamente: Galería de plantillas para TaskFlow");
  // }

  openTemplates() {
    console.log('Abriendo modal...'); // Esto te servirá para debuggear en la consola
    this.showTemplateModal = true;
    this.cdr.detectChanges(); // Esto obliga a Angular a revisar el HTML
  }


  templates = {
    software: [
      [{ name: 'Backlog 🚀', color: 'blue', width: 320, tasks: [{ text: 'Configurar Repositorio', description: 'Crear repo en GitHub', priority: 'high' }] }],
      [{ name: 'En Desarrollo 💻', color: 'amber', width: 320, tasks: [] }],
      [{ name: 'Hecho ✅', color: 'emerald', width: 320, tasks: [] }]
    ],
    marketing: [
      [{ name: 'Estrategia 📱', color: 'purple', width: 320, tasks: [] }],
      [{ name: 'Ejecución 🎨', color: 'rose', width: 320, tasks: [] }]
    ],
    personal: [
      [{ name: 'To-Do 📝', color: 'indigo', width: 320, tasks: [] }],
      [{ name: 'Listo ✨', color: 'emerald', width: 320, tasks: [] }]
    ]
  };

  // loadTemplate(type: 'software' | 'marketing' | 'personal') {
  //   const selected = this.templates[type];
  //   if (confirm(`¿Cargar plantilla de ${type}? Se borrará el progreso actual.`)) {
  //     this.lanes = JSON.parse(JSON.stringify(selected));
  //     this.currentFileName = `plantilla-${type}.tflow`;
  //     this.markAsDirty();
  //     this.saveTasks();
      
  //     this.showTemplateModal = false; // <-- CERRAMOS EL MODAL AQUÍ
  //     this.currentView = 'board'; 
      
  //     this.cdr.detectChanges(); // Para asegurar que Angular pinte los cambios
  //   }
  // }

  // Función para generar IDs únicos rápidos
  generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now();
  }

  loadTemplate(type: 'software' | 'marketing' | 'personal') {
    const selected = this.templates[type];
    
    if (selected) {
      // Mapeamos la plantilla para inyectar IDs únicos reales
      const freshLanes = selected.map(lane => {
        return lane.map(col => ({
          ...col,
          id: 'col-' + this.generateId(),
          tasks: col.tasks.map(task => ({
            ...task,
            id: 'task-' + this.generateId()
          }))
        }));
      });

      this.lanes = freshLanes;
      this.currentFileName = `proyecto-${type}.tflow`;
      this.hasUnsavedChanges = true;
      this.showTemplateModal = false;
      this.currentView = 'board';

      this.saveTasks();
      
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 50);
    }
  }









  save() {
    if (this.currentFileName) {
      // Si ya hay un archivo, simplemente descarga/sobreescribe
      this.executeDownload(this.currentFileName);
    } else {
      // Si no hay archivo abierto, forzamos el 'Guardar como'
      this.exportBoard();
    }
  }

  // Guardar Como (Save As)
  async saveAs() {
    const fileName = prompt("Nombre del archivo:", this.currentFileName || "mi-tablero.json");
    if (fileName) {
      this.currentFileName = fileName;
      this.executeFileSave(fileName);
    }
  }


  private executeFileSave(fileName: string) {
    try {
      const data = JSON.stringify(this.lanes);
      // Aquí tu lógica actual de descarga/escritura de archivo
      console.log(`Guardando en ${fileName}...`);
      
      this.hasUnsavedChanges = false;
      this.saveTasks(); // Sincroniza localstorage también
    } catch (error) {
      console.error("Error al guardar el archivo");
    }
  }

  // Al importar, debemos capturar el nombre
  importFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.currentFileName = file.name;
      // ... resto de tu lógica de lectura ...
    }
  }

  // Función auxiliar para generar la descarga
  private executeDownload(fileName: string) {
    const data = JSON.stringify(this.lanes); // Ajusta según tu estructura
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    
    this.hasUnsavedChanges = false; // Reset de cambios
  }







}