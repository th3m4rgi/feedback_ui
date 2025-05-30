import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { FeedbackService } from '../../services/feedback.service';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-two-step-form',
  standalone: true,
  // providers: [MessageService],
  imports: [
    CommonModule,
    StepsModule,
    ReactiveFormsModule,
    ButtonModule,
    RatingModule,
    ToastModule,
    InputTextModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './two-step-form.component.html',
  styleUrls: ['./two-step-form.component.scss'],
})
export class TwoStepFormComponent {
  [x: string]: any;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  isEditMode = signal(false);
  feedbackId = signal<string | null>(null);
  private feedbackService = inject(FeedbackService);
  private messageService = inject(MessageService);

  activeIndex = signal(0);
  loading = signal(false);

  form = this.fb.group({
    personalInfo: this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    }),
    feedbackDetails: this.fb.group({
      feedback: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1)]]
    })
  });

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.feedbackId.set(params['id']);
        this.loadFeedbackForEditing(params['id']);
      }
    });
  }

  steps = [
    { label: 'Personal Info' },
    { label: 'Feedback' },
    { label: 'Summary' }
  ];

  async loadFeedbackForEditing(id: string) {
    try {
      const feedback = await firstValueFrom(
        this.feedbackService.getFeedback(id)
      );

      this.form.patchValue({
        personalInfo: {
          firstName: feedback.firstName,
          lastName: feedback.lastName,
          email: feedback.email
        },
        feedbackDetails: {
          feedback: feedback.feedback,
          rating: feedback.rating
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load feedback for editing'
      });
      this.router.navigate(['/form']);
    }
  }

  async submitForm() {
    if (this.form.invalid) {
      this.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.loading.set(true);
    try {
      const formData = {
        firstName: this.form.value.personalInfo?.firstName || '',
        lastName: this.form.value.personalInfo?.lastName || '',
        email: this.form.value.personalInfo?.email || '',
        feedback: this.form.value.feedbackDetails?.feedback || '',
        rating: this.form.value.feedbackDetails?.rating || 0
      };

      await firstValueFrom(
        this.isEditMode() && this.feedbackId() ?
        this.feedbackService.updateFeedback(this.feedbackId()!, formData) :
        this.feedbackService.createFeedback(formData)
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: this.isEditMode() ? 'Feedback updated' : 'Feedback submitted'
      });

      setTimeout(() => {
        this.router.navigate(['/list']);
      }, 500);
    } catch (error) {
      console.error('Submission error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to submit feedback'
      });
    } finally {
      this.loading.set(false);
    }
  }

  getCurrentStepGroup() {
    return this.activeIndex() === 0 ? this.form.controls.personalInfo :
           this.activeIndex() === 1 ? this.form.controls.feedbackDetails :
           this.form;
  }

  nextStep() {
    const currentGroup = this.getCurrentStepGroup();
    currentGroup.markAllAsTouched();

    if (currentGroup.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.activeIndex.update(v => Math.min(v + 1, 2));
  }

  prevStep() {
    this.activeIndex.update(v => Math.max(v - 1, 0));
  }

  private markAllAsTouched() {
    this.form.markAllAsTouched();
    Object.values(this.form.controls).forEach(control => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(c => c.markAsTouched());
      }
    });
  }
}