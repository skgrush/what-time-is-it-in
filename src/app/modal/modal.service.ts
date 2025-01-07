import { computed, ElementRef, Injectable, Injector, signal } from '@angular/core';
import { defer, filter, fromEvent, map, Observable, take, throwError } from 'rxjs';
import { ModalComponent } from './modal.component';
import { toObservable } from '@angular/core/rxjs-interop';

export interface ComponentType<T> {
  new(): T;
}

/**
 * Structure passed down to the ModalComponent.
 */
export class _ModalState<T, TInputs extends Readonly<Record<string, unknown>>> {
  constructor(
    readonly componentType: ComponentType<T>,
    readonly injector: Injector,
    readonly inputs: TInputs,
  ) {}
}

export class ModalRef<T> {
  readonly #modalService: ModalService;
  readonly close: () => boolean;
  readonly isOpen: () => boolean;

  readonly closed$: Observable<void>;

  constructor(
    service: ModalService,
    componentWeakRef: WeakRef<ModalComponent>,
    elementWeakRef: WeakRef<ElementRef<HTMLDialogElement>>,
  ) {
    this.#modalService = service;

    this.closed$ = defer(() => {
      const ele = elementWeakRef.deref();
      if (!ele) {
        return throwError(() => new Error('modal already closed'));
      }
      return fromEvent(ele.nativeElement, 'close').pipe(
        take(1),
        map(() => undefined),
      );
    });

    this.close = () => {
      const deref = elementWeakRef.deref();
      if (!deref) {
        return false;
      }
      deref.nativeElement.close();
      return true;
    }

    this.isOpen = () => !!elementWeakRef.deref();

    {
      elementWeakRef.deref()!.nativeElement.showModal();
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  readonly #modalRef = signal<ModalRef<any> | null>(null);
  readonly modalRef$ = toObservable(this.#modalRef).pipe(
    filter(modalRef => modalRef !== null),
    take(1),
  );

  readonly #modalState = signal<_ModalState<unknown, any> | null>(null);

  readonly _modalState = this.#modalState.asReadonly();

  readonly modalIsOpen = computed(() => {
    const modalState = this.#modalState();
    return modalState !== null;
  });

  open$<T, TInputs extends Readonly<Record<string, unknown>>>(
    componentType: ComponentType<T>,
    openerInjector: Injector,
    inputs: TInputs,
  ): Observable<ModalRef<T>> {
    return defer(() => {
      if (this.#modalRef() !== null) {
        return throwError(() => Error('modal still open'));
      }

      const injector = Injector.create({
        name: 'Modal-Service-Injector-Wrapping-opener-injector',
        parent: openerInjector,
        providers: [
        ]
      });

      const modalState = new _ModalState(
        componentType,
        injector,
        inputs
      );

      this.#modalState.set(modalState);

      return this.modalRef$.pipe(

      );
    })
  }

  _modalInitialized(modalComponent: ModalComponent) {
    modalComponent.modalRef$.subscribe(modalRef => {
      if (!modalRef) {
        return;
      }

      modalRef.closed$.subscribe(() => {
        this.#modalState.set(null);
        this.#modalRef.set(null);
      });

      this.#modalRef.set(modalRef);
    })
  }
}
