import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingComponent,
        CommonModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with services', () => {
    expect(component.services).toBeDefined();
    expect(component.services.length).toBeGreaterThan(0);
    expect(component.services.some(s => s.name === 'Cleaning')).toBeTruthy();
  });

  it('should initialize with benefits', () => {
    expect(component.benefits).toBeDefined();
    expect(component.benefits.length).toBeGreaterThan(0);
    expect(component.benefits.some(b => b.title === 'Verified Experts')).toBeTruthy();
  });

  it('should start with first service', () => {
    expect(component.currentServiceIndex).toBe(0);
  });

  it('should not be animating initially', () => {
    expect(component.isAnimating).toBeFalsy();
  });

  it('should get current service', () => {
    component.currentServiceIndex = 0;
    expect(component.currentService).toEqual(component.services[0]);
    
    component.currentServiceIndex = 1;
    expect(component.currentService).toEqual(component.services[1]);
  });

  it('should automatically rotate services', (done) => {
    component.currentServiceIndex = 0;
    const initialIndex = component.currentServiceIndex;
    
    // Wait for the carousel to rotate (3000ms interval + 300ms animation)
    setTimeout(() => {
      fixture.detectChanges();
      const newIndex = component.currentServiceIndex;
      expect(newIndex).toBeGreaterThan(initialIndex);
      done();
    }, 3500);
  });

  it('should display hero section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-title')).toBeTruthy();
  });

  it('should display benefits section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const benefitCards = compiled.querySelectorAll('.benefit-card');
    expect(benefitCards.length).toBeGreaterThan(0);
  });
});
