import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { animate } from 'animejs';
import { CreditCard } from 'src/app/core/models/card-model';

@Component({
  selector: 'app-credit-card',
  templateUrl: './credit-card.component.html',
  styleUrls: ['./credit-card.component.scss'],
  standalone: false,
})
export class CreditCardComponent implements OnInit, OnDestroy {
  @Input() card!: CreditCard;
  @Input() showActions = false;
  @Input() masked: boolean = false;
  @Input() rotated = false; // true en modo carousel (portrait)

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  // Estado del efecto tilt/glare
  glareOpacity = 0;
  glareGradient = '';

  private shimmerInterval: any;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.startShimmer();
  }

  // ── Shimmer ───────────────────────────────────────────

  startShimmer(): void {
    clearInterval(this.shimmerInterval);
    const run = () => {
      const overlay = this.el.nativeElement.querySelector('.shimmer-overlay');
      if (!overlay) return;
      animate(overlay, {
        translateX: ['-100%', '520%'],
        duration: 1400,
        ease: 'inOutSine',
      });
    };
    run();
    this.shimmerInterval = setInterval(run, 4000);
  }

  // ── Tilt 3D (touch) ───────────────────────────────────

  onTouchStart(e: TouchEvent): void {
    // Evita propagación al componente padre (swipe)
    // Solo cuando hay un solo dedo (tilt), no swipe
  }

  onTouchMove(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    this.applyTilt(e.touches[0].clientX, e.touches[0].clientY);
  }

  onTouchEnd(): void {
    this.resetTilt();
  }

  // ── Tilt 3D (mouse — útil en web/tablet) ─────────────

  onMouseMove(e: MouseEvent): void {
    this.applyTilt(e.clientX, e.clientY);
  }

  onMouseLeave(): void {
    this.resetTilt();
  }

  // ── Tilt interno ──────────────────────────────────────

  private applyTilt(clientX: number, clientY: number): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const xRatio = x / rect.width; // 0 → 1
    const yRatio = y / rect.height; // 0 → 1

    const rotateY = (xRatio - 0.5) * 22; // -11 a +11 grados
    const rotateX = -(yRatio - 0.5) * 16; // -8  a +8  grados

    const cardElement = this.el.nativeElement.querySelector('.credit-card');
    if (!cardElement) return;

    const animationOptions: any = {
      rotateX,
      rotateY,
      duration: 120,
      ease: 'outQuad',
    };

    if (this.rotated) {
      animationOptions.rotateZ = 90;
    }

    animate(cardElement, animationOptions);

    // Glare: sigue el cursor
    this.glareOpacity = 0.18;
    this.glareGradient = `radial-gradient(
      circle at ${xRatio * 100}% ${yRatio * 100}%,
      rgba(255,255,255,0.35) 0%,
      transparent 65%
    )`;
  }

  private resetTilt(): void {
    const cardElement = this.el.nativeElement.querySelector('.credit-card');
    if (!cardElement) return;

    const animationOptions: any = {
      rotateX: 0,
      rotateY: 0,
      duration: 450,
      ease: 'outElastic(1, 0.5)',
    };

    if (this.rotated) {
      animationOptions.rotateZ = 90;
    }

    animate(cardElement, animationOptions);
    this.glareOpacity = 0;
  }

  // ── Acciones ──────────────────────────────────────────

  onEditCard(): void {
    this.onEdit.emit(this.card.id);
  }
  onDeleteCard(): void {
    this.onDelete.emit(this.card.id);
  }

  getMaskedNumber(number: string): string {
    return `**** **** **** ${number.slice(-4)}`;
  }

  ngOnDestroy(): void {
    clearInterval(this.shimmerInterval);
  }
}
