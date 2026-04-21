import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { animate, stagger } from 'animejs';
import { CreditCard } from 'src/app/core/models/card-model';
import { CardService } from 'src/app/core/services/card-service';
import { FireauthService } from 'src/app/core/services/fireauth-service';

export type CardMode = 'stack' | 'carousel';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  standalone: false,
})
export class CardListComponent implements AfterViewInit, OnDestroy {
  @Input() cards: CreditCard[] = [];
  @Input() mode: CardMode = 'stack';
  @Input() cardMasked: boolean = false;

  // @Output() editCard = new EventEmitter<CreditCard>();
  // @Output() deleteCard = new EventEmitter<CreditCard>();
  @Output() selectedCard = new EventEmitter<CreditCard>();
  @Output() setDefault = new EventEmitter<CreditCard>();

  // #cardItem apunta al div wrapper (.card-stack__item o .carousel-slide)
  @ViewChildren('cardItem') cardItems!: QueryList<ElementRef>;
  currentUserId: string = '';

  currentIndex = 0;

  private entranceTriggered = false;
  private startX = 0;
  private startY = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: FireauthService,
    private cardService: CardService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  get currentCard(): CreditCard {
    return this.cards[this.currentIndex];
  }

  // ── Lifecycle ─────────────────────────────────────────

  ngAfterViewInit(): void {
    if (this.mode === 'carousel') {
      setTimeout(() => this.animateCarouselEntrance(), 100);
    }

    if (this.mode === 'stack' && this.entranceTriggered) {
      setTimeout(() => this.animateStackEntrance(), 100);
    }
  }

  // ── API pública ───────────────────────────────────────

  /** Llamar desde ionViewDidEnter del padre */
  triggerEntrance(): void {
    this.entranceTriggered = true;
    if (this.mode === 'stack') {
      this.animateStackEntrance();
    }
  }

  // ══════════════════════════════════════════════════════
  // STACK — animaciones
  // ══════════════════════════════════════════════════════

  private animateStackEntrance(): void {
    this.cdr.detectChanges();
    const els = this.cardItems.toArray().map((el) => el.nativeElement);

    // Estado inicial: todas apiladas debajo
    els.forEach((el: HTMLElement, i: number) => {
      const offset = i - this.currentIndex;
      el.style.opacity = '0';
      el.style.zIndex = `${els.length - i}`;
      el.style.transform = `translateY(${120 + offset * 12}px) scale(${
        1 - Math.abs(offset) * 0.05
      })`;
    });

    // 1) Subida rápida con overshoot
    animate(els, {
      translateY: (_: any, i: number) => {
        const offset = i - this.currentIndex;
        return `${offset * 12 - 14}px`;
      },
      opacity: (_: any, i: number) => {
        const abs = Math.abs(i - this.currentIndex);
        return abs === 0 ? 1 : abs === 1 ? 0.6 : 0.3;
      },
      scale: (_: any, i: number) => {
        const abs = Math.abs(i - this.currentIndex);
        return 1 - abs * 0.05 + 0.015;
      },
      duration: 520,
      delay: stagger(70),
      ease: 'outExpo',
    });

    // 2) Rebote hacia posición final
    setTimeout(() => {
      animate(els, {
        translateY: (_: any, i: number) => {
          const offset = i - this.currentIndex;
          return `${offset * 12}px`;
        },
        scale: (_: any, i: number) => {
          const abs = Math.abs(i - this.currentIndex);
          return 1 - abs * 0.05;
        },
        duration: 320,
        delay: stagger(40),
        ease: 'outBounce',
      });
    }, 530);

    // 3) Info items
    setTimeout(() => this.animateInfoItems(), 700);
  }

  selectCard(index: number): void {
    if (index === this.currentIndex) return;
    this.currentIndex = index;
    // this.selectedCard.emit(this.currentCard);

    if (this.mode === 'stack') {
      this.updateStackPositions();
    }
  }

  private updateStackPositions(): void {
    const els = this.cardItems.toArray().map((el) => el.nativeElement);

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

    setTimeout(() => this.animateInfoItems(), 150);
  }

  private animateInfoItems(): void {
    const infoItems = document.querySelectorAll(
      'app-card-list .card-info-item'
    );
    if (!infoItems.length) return;

    animate(infoItems, {
      translateX: [-14, 0],
      opacity: [0, 1],
      duration: 450,
      delay: stagger(55),
      ease: 'outCubic',
    });
  }

  // ══════════════════════════════════════════════════════
  // CAROUSEL — animaciones
  // ══════════════════════════════════════════════════════

  private animateCarouselEntrance(): void {
    const slides = this.cardItems.toArray().map((el) => el.nativeElement);

    slides.forEach((el: HTMLElement, i: number) => {
      el.style.opacity = '0';
      el.style.transform =
        i === this.currentIndex ? 'translateX(0%)' : 'translateX(100%)';
    });

    animate(slides[this.currentIndex], {
      translateX: ['100%', '0%'],
      opacity: [0, 1],
      duration: 600,
      ease: 'outExpo',
    });
  }

  private goToCard(nextIndex: number): void {
    if (nextIndex === this.currentIndex) return;
    if (nextIndex < 0 || nextIndex >= this.cards.length) return;

    const slides = this.cardItems.toArray().map((el) => el.nativeElement);
    const direction = nextIndex > this.currentIndex ? 1 : -1;
    const current = slides[this.currentIndex];
    const next = slides[nextIndex];

    next.style.opacity = '1';
    next.style.transform = `translateX(${direction * 100}%)`;

    animate(current, {
      translateX: `${-direction * 100}%`,
      opacity: [1, 0],
      duration: 350,
      ease: 'inCubic',
    });

    animate(next, {
      translateX: [`${direction * 100}%`, '0%'],
      opacity: [1, 1],
      duration: 350,
      ease: 'outCubic',
    });

    this.currentIndex = nextIndex;
    // this.selectedCard.emit(this.currentCard);
  }

  // ══════════════════════════════════════════════════════
  // Swipe
  // ══════════════════════════════════════════════════════

  onTouchStart(e: TouchEvent): void {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const deltaX = e.changedTouches[0].clientX - this.startX;
    const deltaY = e.changedTouches[0].clientY - this.startY;

    // Ignorar swipes más verticales que horizontales
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < 50) return;

    if (this.mode === 'stack') {
      if (deltaX < 0 && this.currentIndex < this.cards.length - 1) {
        this.selectCard(this.currentIndex + 1);
      } else if (deltaX > 0 && this.currentIndex > 0) {
        this.selectCard(this.currentIndex - 1);
      }
    }

    if (this.mode === 'carousel') {
      if (deltaX < 0) {
        this.goToCard(this.currentIndex + 1);
      } else {
        this.goToCard(this.currentIndex - 1);
      }
    }
  }

  onEdit(cardId: string): void {
    // this.editCard.emit(this.currentCard);
    console.log('editar este es el metodo', cardId);
    this.router.navigate(['/add-card', cardId]);
  }

  onDelete(cardId: string): void {
    console.log('eliminar este es el metodo', cardId);
    if (confirm('¿Estás seguro que deseas eliminar esta tarjeta?')) {
      this.cardService.deleteCard(this.currentUserId, cardId);
      // this.deleteCard.emit(this.currentCard);
    }
  }

  onSetDefault(): void {
    this.setDefault.emit(this.currentCard);
  }

  ngOnDestroy(): void {}
}
