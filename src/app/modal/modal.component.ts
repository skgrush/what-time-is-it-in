import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { ModalRef, ModalService } from './modal.service';
import { NgComponentOutlet } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'dialog[wtiii-modal]',
  imports: [
    NgComponentOutlet,
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'onClick($event)',
  }
})
export class ModalComponent implements OnInit {

  readonly #modalService = inject(ModalService);
  readonly #elementRef = inject(ElementRef<HTMLDialogElement>);

  protected readonly stateAndModalRefAndInjector = computed(() => {
    const modalState = this.#modalService._modalState();

    if (modalState === null) {
      return null;
    }

    const modalRef = new ModalRef(
      this.#modalService,
      new WeakRef(this),
      new WeakRef(this.#elementRef),
    );

    const childInjector = Injector.create({
      name: 'Modal-Injector-Context',
      providers: [
        { provide: ModalRef, useValue: modalRef },
      ],
      parent: modalState.injector,
    });

    return {
      modalState,
      modalRef,
      childInjector,
    };
  });

  public readonly modalRef = computed(() => {
    const m = this.stateAndModalRefAndInjector();

    return m?.modalRef ?? null;
  });
  public readonly modalRef$ = toObservable(this.modalRef);

  ngOnInit() {
    this.#modalService._modalInitialized(this);
  }

  protected onClick(e: MouseEvent) {
    if (this.#isClickOutsideModal(e)) {
      this.#elementRef.nativeElement.close()
    }
  }

  #isClickOutsideModal(e: MouseEvent) {
    return (
      e.target instanceof HTMLDialogElement && (
        e.layerX < 0 || e.layerY < 0 || e.layerX > e.target.offsetWidth || e.layerY > e.target.offsetHeight
      )
    );
  }
}
