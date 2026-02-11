import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  url?: string;
}

@Component({
  selector: 'app-certificates-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Professional Certificates</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="expert-info" *ngIf="expertName">
            <p><strong>Expert:</strong> {{ expertName }}</p>
          </div>

          <div class="certificates-list" *ngIf="certificates && certificates.length > 0">
            <div class="certificate-card" *ngFor="let cert of certificates">
              <div class="cert-icon">📜</div>
              <div class="cert-details">
                <h3>{{ cert.name }}</h3>
                <p class="issuer">Issued by: {{ cert.issuer }}</p>
                <p class="date">Issue Date: {{ formatDate(cert.issueDate) }}</p>
                <a *ngIf="cert.url" [href]="cert.url" target="_blank" class="view-link">
                  View Certificate →
                </a>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!certificates || certificates.length === 0">
            <p>No certificates available</p>
          </div>

          <div class="verification-note">
            <p>✓ All certificates have been verified by HouseMate</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 22px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #666;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .expert-info {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }

    .expert-info p {
      margin: 0;
      font-size: 16px;
    }

    .certificates-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }

    .certificate-card {
      display: flex;
      gap: 15px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      transition: all 0.2s;
    }

    .certificate-card:hover {
      border-color: #4caf50;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .cert-icon {
      font-size: 48px;
      flex-shrink: 0;
    }

    .cert-details {
      flex: 1;
    }

    .cert-details h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #333;
    }

    .cert-details p {
      margin: 5px 0;
      font-size: 14px;
      color: #666;
    }

    .view-link {
      display: inline-block;
      margin-top: 10px;
      color: #4caf50;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
    }

    .view-link:hover {
      text-decoration: underline;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .verification-note {
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .verification-note p {
      margin: 0;
      font-size: 13px;
      color: #4caf50;
    }

    @media (max-width: 768px) {
      .certificate-card {
        flex-direction: column;
        text-align: center;
      }

      .cert-icon {
        font-size: 36px;
      }
    }
  `]
})
export class CertificatesModalComponent {
  @Input() show: boolean = false;
  @Input() certificates: Certificate[] = [];
  @Input() expertName: string = '';
  
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
