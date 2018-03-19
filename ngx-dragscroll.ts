import {ChangeDetectorRef, Directive, ElementRef, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {switchMap, takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[appDragScroll]'
})
export class DragScrollDirective implements OnInit, OnDestroy {
  @Input() dragScrollOnMobile = true;
  mousedown$: Observable<MouseEvent>;
  mousemove$: Observable<MouseEvent>;
  mouseup$: Observable<MouseEvent>;
  dragDrop$: Observable<MouseEvent>;
  destroy$ = new Subject();
  lastX: number;
  lastY: number;

  constructor(private el: ElementRef, private ngZone: NgZone) {
  }

  init() {
    // Create observables from mouse events
    this.mousedown$ = fromEvent(this.el.nativeElement, 'mousedown');
    this.mouseup$ = fromEvent(document, 'mouseup');
    this.mousemove$ = fromEvent(document, 'mousemove');
    this.dragDrop$ = this.mousedown$.pipe(
      switchMap(() => this.mousemove$.pipe(
        takeUntil(this.mouseup$)
      ))
    );

    // Subscribe to mouse events
    this.mousedown$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.lastX = event.clientX;
        this.lastY = event.clientY;
      });

    this.dragDrop$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        this.el.nativeElement.scrollLeft -= (-this.lastX + (this.lastX = event.clientX));
        this.el.nativeElement.scrollTop -= (-this.lastY + (this.lastY = event.clientY));
      })
    ;
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.init();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
