// src/app/task-list/task-list.component.ts
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Task, TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import {
  faPen,
  faCheck,
  faTimes,
  faTrash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// NEW IMPORTS for @ng-bootstrap/ng-bootstrap modals
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap'; // NgbModule for standalone components

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    NgbModule, // <--- ADD NgbModule here for standalone components
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks$: Observable<Task[]> | undefined;
  newTaskTitle: string = '';
  newTaskDescription: string = '';
  isLoadingTasks: boolean = false;
  isAddingTask: boolean = false;
  loadingTaskId: number | null = null;

  // For Editing
  editingTaskId: number | null = null;
  editedTaskTitle: string = '';
  editedTaskDescription: string = '';

  // Font Awesome Icons
  faPen = faPen;
  faCheck = faCheck;
  faTimes = faTimes;
  faTrash = faTrash;
  faSpinner = faSpinner;

  private destroy$ = new Subscription();

  // Modal properties (using NgbModalRef)
  modalRef?: NgbModalRef; // <--- Changed from BsModalRef to NgbModalRef
  taskToDelete: Task | null = null;

  constructor(
    private taskService: TaskService,
    private toastr: ToastrService,
    private modalService: NgbModal // <--- Changed from BsModalService to NgbModal
  ) { }

  ngOnInit(): void {
    this.tasks$ = this.taskService.tasks$;

    this.isLoadingTasks = true;
    this.destroy$.add(
      this.taskService.getTasks().pipe(
        tap(() => this.isLoadingTasks = false),
        catchError(error => {
          this.toastr.error('Failed to load tasks.', 'Error');
          this.isLoadingTasks = false;
          return of([]);
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }

  addTask(): void {
    if (!this.newTaskTitle.trim()) {
      this.toastr.warning('Task title cannot be empty.', 'Warning');
      return;
    }

    this.isAddingTask = true;
    const taskToAdd: Omit<Task, 'id' | 'user_id' | 'created_at'> = {
      title: this.newTaskTitle.trim(),
      description: this.newTaskDescription.trim(),
      completed: false
    };

    this.destroy$.add(
      this.taskService.addTask(taskToAdd).pipe(
        finalize(() => {
          this.isAddingTask = false;
          this.newTaskTitle = '';
          this.newTaskDescription = '';
        }),
        catchError(error => {
          this.toastr.error('Failed to add task.', 'Error');
          return of(null);
        })
      ).subscribe(
        (addedTask) => {
          if (addedTask) {
            this.toastr.success('Task added successfully!', 'Success');
          }
        }
      )
    );
  }

  toggleTaskCompletion(task: Task): void {
    this.loadingTaskId = task.id!;
    const updatedStatus = !task.completed;
    this.destroy$.add(
      this.taskService.updateTask(task.id!, { completed: updatedStatus }).pipe(
        finalize(() => this.loadingTaskId = null),
        catchError(error => {
          this.toastr.error('Failed to update task status.', 'Error');
          return of(null);
        })
      ).subscribe(
        (response) => {
          if (response) {
            this.toastr.success('Task status updated!', 'Success');
          }
        }
      )
    );
  }

  // Re-implement modal methods using NgbModal
  confirmDelete(content: TemplateRef<any>, task: Task): void { // <--- content instead of template
    this.taskToDelete = task;
    this.modalRef = this.modalService.open(content, { centered: true, size: 'sm' }); // <--- NgbModal uses .open()
  }

  deleteConfirmed(): void {
    if (this.taskToDelete && this.taskToDelete.id !== undefined) {
      this.loadingTaskId = this.taskToDelete.id;
      this.destroy$.add(
        this.taskService.deleteTask(this.taskToDelete.id).pipe(
          finalize(() => {
            this.loadingTaskId = null;
            this.modalRef?.close('delete'); // <--- NgbModal uses .close()
            this.taskToDelete = null;
          }),
          catchError(error => {
            this.toastr.error('Failed to delete task.', 'Error');
            return of(null);
          })
        ).subscribe(
          (response) => {
            if (response) {
              this.toastr.success('Task deleted!', 'Success');
            }
          }
        )
      );
    } else {
      this.toastr.error('Task ID is missing. Cannot delete task.', 'Error');
      this.modalRef?.close('error'); // <--- NgbModal uses .close()
    }
  }

  declineDelete(): void {
    this.modalRef?.dismiss('cancel'); // <--- NgbModal uses .dismiss()
    this.taskToDelete = null;
  }

  editTask(task: Task): void {
    this.editingTaskId = task.id!;
    this.editedTaskTitle = task.title;
    this.editedTaskDescription = task.description || '';
  }

  saveTask(task: Task): void {
    if (!this.editedTaskTitle.trim()) {
      this.toastr.warning('Task title cannot be empty.', 'Warning');
      return;
    }

    this.loadingTaskId = task.id!;
    const updatedTask: Partial<Task> = {
      title: this.editedTaskTitle.trim(),
      description: this.editedTaskDescription.trim()
    };

    this.destroy$.add(
      this.taskService.updateTask(task.id!, updatedTask).pipe(
        finalize(() => {
          this.loadingTaskId = null;
          this.editingTaskId = null;
        }),
        catchError(error => {
          this.toastr.error('Failed to save changes.', 'Error');
          return of(null);
        })
      ).subscribe(
        (response) => {
          if (response) {
            this.toastr.success('Task updated successfully!', 'Success');
          }
        }
      )
    );
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.editedTaskTitle = '';
    this.editedTaskDescription = '';
  }
}