import {
  Component, Input, OnDestroy, AfterViewInit,
  ViewChildren, QueryList, ElementRef, Output, EventEmitter, OnChanges,
  ChangeDetectorRef
} from '@angular/core';
import { animate, stagger } from 'animejs';
import { CreditCard } from 'src/app/core/models/card-model';

export type CardMode = 'stack' | 'carousel';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
})
export class CardComponent implements AfterViewInit, OnDestroy {

  @Input() cards: CreditCard[] = [];
  @Input() mode: CardMode = 'stack';
  @Output() editCard   = new EventEmitter<CreditCard>();
  @Output() deleteCard = new EventEmitter<CreditCard>();
  @Output() selectedCard = new EventEmitter<CreditCard>();

  @ViewChildren('cardItem') cardItems!: QueryList<ElementRef>;

  currentIndex = 0;
  private shimmerInterval: any;
  private startX = 0;
  private startY = 0;

  constructor(private cdr: ChangeDetectorRef){

  }

  // Controla si la animación de entrada ya fue disparada externamente
  private entranceTriggered = false;

  get currentCard(): CreditCard {
    return this.cards[this.currentIndex];
  }

  ngAfterViewInit(): void {
    // En modo carousel se anima sola; en stack espera triggerEntrance()
    if (this.mode === 'carousel') {
      setTimeout(() => {
        this.animateCarouselEntrance();
        this.startShimmer();
      }, 100);
    }

    if (this.mode === 'stack' && this.entranceTriggered) {
      setTimeout(() => {
        this.animateStackEntrance();
        this.startShimmer();
      }, 100);
    }
  }

  // ── API pública: llamar desde la página ──────────────

  /** Llama esto desde ionViewDidEnter en el Home */
  triggerEntrance(): void {
    this.entranceTriggered = true;
    if (this.mode === 'stack') {
      this.animateStackEntrance();
      this.startShimmer();
    }
  }

  // ── Stack: animación de salto ────────────────────────

  private animateStackEntrance(): void {
    this.cdr.detectChanges();
    const els = this.cardItems.toArray().map(el => el.nativeElement);

    // Estado inicial: todas apiladas debajo de pantalla
    els.forEach((el: HTMLElement, i: number) => {
      const offset = i - this.currentIndex;
      el.style.opacity = '0';
      el.style.zIndex = `${els.length - i}`;
      el.style.transform = `translateY(${120 + offset * 12}px) scale(${1 - Math.abs(offset) * 0.05})`;
    });

    // 1) Subida rápida (overshoot)
    animate(els, {
      translateY: (el: any, i: number) => {
        const offset = i - this.currentIndex;
        return `${offset * 12 - 14}px`; // sube un poco de más
      },
      opacity: (el: any, i: number) => {
        const abs = Math.abs(i - this.currentIndex);
        return abs === 0 ? 1 : abs === 1 ? 0.6 : 0.3;
      },
      scale: (el: any, i: number) => {
        const abs = Math.abs(i - this.currentIndex);
        return (1 - abs * 0.05) + 0.015; // un poco más grande
      },
      duration: 520,
      delay: stagger(70),
      ease: 'outExpo',
    });

    // 2) Rebote hacia abajo (el "salto")
    setTimeout(() => {
      animate(els, {
        translateY: (el: any, i: number) => {
          const offset = i - this.currentIndex;
          return `${offset * 12}px`; // posición final real
        },
        scale: (el: any, i: number) => {
          const abs = Math.abs(i - this.currentIndex);
          return 1 - abs * 0.05;
        },
        duration: 320,
        delay: stagger(40),
        ease: 'outBounce',
      });
    }, 530); // justo después de la subida

    // Info de la tarjeta activa
    setTimeout(() => {

      const infoItems = document.querySelectorAll('.card-info-item');
      if(infoItems.length === 0) return;
      animate(infoItems, {
        translateX: [-16, 0],
        opacity: [0, 1],
        duration: 500,
        delay: stagger(60),
        ease: 'outCubic',
      });
    }, 700);
  }


  // ── Carousel: entrada ─────────────────────────────────
  private animateCarouselEntrance(): void {
    const slides = this.cardItems.toArray().map(el => el.nativeElement);

    slides.forEach((el: HTMLElement, i: number) => {
      el.style.opacity   = '0';
      el.style.transform = i === this.currentIndex ? 'translateX(0%)' : 'translateX(100%)';
    });

    animate(slides[this.currentIndex], {
      translateX: ['100%', '0%'],
      opacity:    [0, 1],
      duration:   600,
      ease:       'outExpo',
    });
  }
  // ── Shimmer ───────────────────────────────────────────

  private startShimmer(): void {
    clearInterval(this.shimmerInterval);
    const run = () => {
      animate('.shimmer-overlay', {
        translateX: ['-100%', '420%'],
        duration: 1400,
        ease: 'inOutSine',
      });
    };
    run();
    this.shimmerInterval = setInterval(run, 4000);
  }

  // ── Stack: cambiar tarjeta ────────────────────────────

  selectCard(index: number): void {
    if (index === this.currentIndex) return;
    this.currentIndex = index;

    if (this.mode === 'stack') {
      this.updateStackPositions();
    }
    this.startShimmer();
  }

  private updateStackPositions(): void {
    const els = this.cardItems.toArray().map(el => el.nativeElement);

    els.forEach((el: HTMLElement, i: number) => {
      const offset = i - this.currentIndex;
      const absOffset = Math.abs(offset);
      el.style.zIndex = `${els.length - absOffset}`;

      animate(el, {
        translateY: `${offset * 20}px`,
        scale: 1 - absOffset * 0.05,
        opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.6 : 0.3,
        duration: 450,
        ease: 'outExpo',
      });
    });

    setTimeout(() => {
      const infoItems = document.querySelectorAll('.card-info-item');

      if(infoItems.length === 0) return;
      animate(infoItems, {
        translateX: [-12, 0],
        opacity: [0, 1],
        duration: 400,
        delay: stagger(50),
        ease: 'outCubic',
      });
    }, 150);
  }

  // ── Carousel: cambiar tarjeta ─────────────────────────

  private goToCard(nextIndex: number): void {
    if (nextIndex === this.currentIndex) return;
    if (nextIndex < 0 || nextIndex >= this.cards.length) return;

    const slides    = this.cardItems.toArray().map(el => el.nativeElement);
    const direction = nextIndex > this.currentIndex ? 1 : -1;
    // direction  1 → siguiente: actual va a la izquierda, nueva entra por la derecha
    // direction -1 → anterior:  actual va a la derecha, nueva entra por la izquierda

    const current = slides[this.currentIndex];
    this.selectedCard.emit(this.cards[current]);
    const next    = slides[nextIndex];

    next.style.opacity   = '1';
    next.style.transform = `translateX(${direction * 100}%)`;

    animate(current, {
      translateX: `${-direction * 100}%`,
      opacity:    [1, 0],
      duration:   350,
      ease:       'inCubic',
    });

    animate(next, {
      translateX: [`${direction * 100}%`, '0%'],
      opacity:    [1, 1],
      duration:   350,
      ease:       'outCubic',
    });

    this.currentIndex = nextIndex;
    this.startShimmer();
  }

  // ── Swipe handlers ────────────────────────────────────

  onTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const deltaX = e.changedTouches[0].clientX - this.startX;
    const deltaY = e.changedTouches[0].clientY - this.startY;

    if (this.mode === 'stack') {
      if (Math.abs(deltaX) < 50) return;
      if (deltaX < 0 && this.currentIndex < this.cards.length - 1) {
        this.selectCard(this.currentIndex + 1);
      } else if (deltaX > 0 && this.currentIndex > 0) {
        this.selectCard(this.currentIndex - 1);
      }
    }

    if (this.mode === 'carousel') {
      // swipe horizontal aunque la tarjeta esté rotada
      if (Math.abs(deltaX) < 50) return;
      if (deltaX < 0) {
        this.goToCard(this.currentIndex + 1); // swipe izquierda → siguiente
      } else {
        this.goToCard(this.currentIndex - 1); // swipe derecha → anterior
      }
    }
  }

  // ── Acciones ──────────────────────────────────────────

  onEdit(): void   { this.editCard.emit(this.currentCard); }
  onDelete(): void { this.deleteCard.emit(this.currentCard); }

  getMaskedNumber(number: string): string {
    return `**** **** **** ${number.slice(-4)}`;
  }

  ngOnDestroy(): void {
    clearInterval(this.shimmerInterval);
  }
}
