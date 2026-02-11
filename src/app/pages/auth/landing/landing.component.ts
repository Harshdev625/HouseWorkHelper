import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ServiceItem {
  name: string;
  icon: string;
  image: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  currentServiceIndex = 0;
  isAnimating = false;
  private intervalId?: number;

  services: ServiceItem[] = [
    {
      name: 'Cleaning', 
      icon: '🧹',
      image: 'assets/images/services/cleaning.jpg'
    },
    {
      name: 'Gardening',
      icon: '🌱', 
      image: 'assets/images/services/gardening.jpg'
    },
    {
      name: 'Cooking',
      icon: '🍳',
      image: 'assets/images/services/cooking.jpg'
    }
  ];

  benefits: Benefit[] = [
    {
      icon: 'verified_user',
      title: 'Verified Experts',
      description: 'All experts undergo KYC verification and background checks'
    },
    {
      icon: 'flash_on',
      title: 'Fast Service', 
      description: 'ASAP booking or schedule ahead as per your convenience'
    },
    {
      icon: 'high_quality',
      title: 'Quality Assurance',
      description: 'Guaranteed service backed by our customer ratings'
    },
    {
      icon: 'support_agent',
      title: 'Expert Support',
      description: '24x7 verified service pros and extensive range'
    }
  ];

  get currentService(): ServiceItem {
    return this.services[this.currentServiceIndex];
  }

  ngOnInit(): void {
    this.startServiceCarousel();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startServiceCarousel(): void {
    this.intervalId = window.setInterval(() => {
      this.isAnimating = true;
      
      setTimeout(() => {
        this.currentServiceIndex = (this.currentServiceIndex + 1) % this.services.length;
        this.isAnimating = false;
      }, 300);
    }, 3000);
  }
}
