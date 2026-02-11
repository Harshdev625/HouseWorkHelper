import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OtpService } from '../../../core/services/otp.service';

@Component({
  selector: 'app-otp-verification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ action === 'START' ? 'Start Job' : 'Complete Job' }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <p class="instruction">
            {{ action === 'START' 
              ? 'Please ask the customer for the OTP to start the job.' 
              : 'Please ask the customer for the OTP to mark the job as complete.' 
            }}
          </p>

          <div class="otp-section">
            <label>Enter 4-digit OTP</label>
            <input 
              type="text" 
              [(ngModel)]="otp" 
              class="otp-input" 
              maxlength="4" 
              placeholder="0000"
              [disabled]="verifying"
              (keyup.enter)="verify()">
          </div>

          <div class="error" *ngIf="error">{{ error }}</div>

          <div class="modal-actions">
            <button class="secondary-btn" (click)="close()" [disabled]="verifying">Cancel</button>
            <button class="verify-btn" (click)="verify()" [disabled]="verifying || otp.length !== 4">
              {{ verifying ? 'Verifying...' : 'Verify & ' + (action === 'START' ? 'Start' : 'Complete') }}
            </button>
          </div>

          <div class="help-text">
            <p>The OTP is displayed on the customer's booking details page.</p>
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
      max-width: 450px;
      width: 90%;
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

    .instruction {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .otp-section {
      margin-bottom: 20px;
    }

    .otp-section label {
      display: block;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .otp-input {
      width: 100%;
      padding: 15px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 24px;
      text-align: center;
      letter-spacing: 8px;
      font-weight: bold;
    }

    .otp-input:focus {
      outline: none;
      border-color: #4caf50;
    }

    .otp-input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .error {
      padding: 10px;
      background: #ffebee;
      color: #d32f2f;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .secondary-btn {
      flex: 1;
      padding: 12px;
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .secondary-btn:hover {
      background: #e0e0e0;
    }

    .secondary-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .verify-btn {
      flex: 2;
      padding: 12px;
      background: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .verify-btn:hover:not(:disabled) {
      background: #45a049;
    }

    .verify-btn:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .help-text {
      padding-top: 15px;
      border-top: 1px solid #e0e0e0;
    }

    .help-text p {
      margin: 0;
      font-size: 13px;
      color: #999;
    }
  `]
})
export class OtpVerificationModalComponent {
  @Input() show: boolean = false;
  @Input() bookingId: string = '';
  @Input() action: 'START' | 'END' = 'START';
  
  @Output() verified = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  otp: string = '';
  verifying: boolean = false;
  error: string | null = null;

  constructor(private otpService: OtpService) {}

  verify(): void {
    if (this.otp.length !== 4) {
      this.error = 'Please enter a valid 4-digit OTP';
      return;
    }

    this.verifying = true;
    this.error = null;

    this.otpService.verifyOTP({
      bookingId: this.bookingId,
      otp: this.otp,
      action: this.action
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Update booking status based on action
          if (this.action === 'START') {
            this.otpService.startJob(this.bookingId, this.otp).subscribe({
              next: () => {
                this.verified.emit();
                this.close();
              },
              error: () => {
                this.error = 'Failed to start job. Please try again.';
                this.verifying = false;
              }
            });
          } else {
            this.otpService.endJob(this.bookingId, this.otp).subscribe({
              next: () => {
                this.verified.emit();
                this.close();
              },
              error: () => {
                this.error = 'Failed to complete job. Please try again.';
                this.verifying = false;
              }
            });
          }
        } else {
          this.error = response.message;
          this.verifying = false;
        }
      },
      error: () => {
        this.error = 'Failed to verify OTP. Please try again.';
        this.verifying = false;
      }
    });
  }

  close(): void {
    this.otp = '';
    this.error = null;
    this.verifying = false;
    this.closed.emit();
  }
}
