import {
  Component, Input, OnDestroy, AfterViewInit,
  ViewChildren, QueryList, ElementRef, Output, EventEmitter
} from '@angular/core';
import { animate, stagger } from 'animejs';
import { CreditCard } from 'src/app/core/models/card-model';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
})
export class CardComponent implements AfterViewInit, OnDestroy {

  @Input() cards: CreditCard[] = [];
  @Output() editCard   = new EventEmitter<CreditCard>();
  @Output() deleteCard = new EventEmitter<CreditCard>();

  @ViewChildren('cardItem') cardItems!: QueryList<ElementRef>;

  currentIndex = 0;
  private shimmerInterval: any;
  private startX = 0;

  get currentCard(): CreditCard {
    return this.cards[this.currentIndex];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animateEntrance();
      this.startShimmer();
    }, 100);
  }

  // ── Animación entrada 3D apilada ──────────────────

  private animateEntrance(): void {
    const els = this.cardItems.toArray().map(el => el.nativeElement);

    // Primero posiciona todas en el estado apilado
    els.forEach((el: HTMLElement, i: number) => {
      const offset = i - this.currentIndex;
      el.style.opacity = '0';
      el.style.transform = `translateY(${offset * 12}px) scale(${1 - offset * 0.05}) translateZ(${-offset * 30}px)`;
      el.style.zIndex = `${els.length - i}`;
    });

    // Anima la entrada desde abajo
    animate(els, {
      translateY: (el: any, i: number) => {
        const offset = i - this.currentIndex;
        return [`${60 + offset * 12}px`, `${offset * 12}px`];
      },
      opacity: (el: any, i: number) => {
        const offset = Math.abs(i - this.currentIndex);
        return [0, offset === 0 ? 1 : offset === 1 ? 0.6 : 0.3];
      },
      scale: (el: any, i: number) => {
        const offset = Math.abs(i - this.currentIndex);
        return 1 - offset * 0.05;
      },
      duration: 800,
      delay: stagger(80),
      ease: 'outExpo',
    });

    // Info de la tarjeta activa
    setTimeout(() => {
      animate('.card-info-item', {
        translateX: [-16, 0],
        opacity: [0, 1],
        duration: 500,
        delay: stagger(60),
        ease: 'outCubic',
      });
    }, 400);
  }

  // ── Shimmer ───────────────────────────────────────

  private startShimmer(): void {
    clearInterval(this.shimmerInterval);
    const run = () => {
      animate('.shimmer-overlay', {
        translateX: ['-100%', '220%'],
        duration: 1400,
        ease: 'inOutSine',
      });
    };
    run();
    this.shimmerInterval = setInterval(run, 4000);
  }

  // ── Cambiar tarjeta activa ────────────────────────

  selectCard(index: number): void {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    this.updateStackPositions();
    this.startShimmer();
  }

  private updateStackPositions(): void {
    const els = this.cardItems.toArray().map(el => el.nativeElement);

    els.forEach((el: HTMLElement, i: number) => {
      const offset = i - this.currentIndex;
      const absOffset = Math.abs(offset);

      el.style.zIndex = `${els.length - absOffset}`;

      animate(el, {
        translateY: `${offset * 12}px`,
        scale: 1 - absOffset * 0.05,
        opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.6 : 0.3,
        duration: 450,
        ease: 'outExpo',
      });
    });

    setTimeout(() => {
      animate('.card-info-item', {
        translateX: [-12, 0],
        opacity: [0, 1],
        duration: 400,
        delay: stagger(50),
        ease: 'outCubic',
      });
    }, 100);
  }

  // ── Swipe ─────────────────────────────────────────

  onTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const delta = e.changedTouches[0].clientX - this.startX;
    if (Math.abs(delta) < 50) return;

    if (delta < 0 && this.currentIndex < this.cards.length - 1) {
      this.selectCard(this.currentIndex + 1);
    } else if (delta > 0 && this.currentIndex > 0) {
      this.selectCard(this.currentIndex - 1);
    }
  }

  // ── Acciones ──────────────────────────────────────

  onEdit(): void {
    this.editCard.emit(this.currentCard);
  }

  onDelete(): void {
    this.deleteCard.emit(this.currentCard);
  }

  getMaskedNumber(number: string): string {
    return `**** **** **** ${number.slice(-4)}`;
  }

  ngOnDestroy(): void {
    clearInterval(this.shimmerInterval);
  }
}
