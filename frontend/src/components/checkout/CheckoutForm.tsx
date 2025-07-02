'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Truck, User } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
// import PaymentSection from './PaymentSection';
import styles from './CheckoutForm.module.css';

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().min(1, 'Country is required')
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export default function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { setShippingInfo, shippingInfo } = useCartStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: shippingInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    mode: 'onChange'
  });

  const steps = [
    { id: 1, title: 'Shipping Information', icon: Truck },
    { id: 2, title: 'Payment Method', icon: CreditCard },
    { id: 3, title: 'Review & Place Order', icon: User }
  ];

  const onSubmitShipping = (data: ShippingFormData) => {
    setShippingInfo(data);
    setCurrentStep(2);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === 1) {
      setCurrentStep(1);
    } else if (stepId === 2 && shippingInfo) {
      setCurrentStep(2);
    } else if (stepId === 3 && shippingInfo) {
      setCurrentStep(3);
    }
  };

  return (
    <div className={styles.checkoutForm}>
      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = step.id === 1 || (step.id <= 2 && shippingInfo) || (step.id === 3 && shippingInfo);
          
          return (
            <div key={step.id} className={styles.stepWrapper}>
              <button
                className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                onClick={() => isClickable && handleStepClick(step.id)}
                disabled={!isClickable}
              >
                <Icon className={styles.stepIcon} />
                <span className={styles.stepNumber}>{step.id}</span>
              </button>
              <span className={styles.stepTitle}>{step.title}</span>
              {index < steps.length - 1 && (
                <div className={`${styles.stepConnector} ${isCompleted ? styles.completed : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className={styles.stepContent}>
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(onSubmitShipping)} className={styles.form}>
            <h3 className={styles.sectionTitle}>Shipping Information</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name *</label>
                <input
                  {...register('firstName')}
                  className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <span className={styles.errorMessage}>{errors.firstName.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name *</label>
                <input
                  {...register('lastName')}
                  className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <span className={styles.errorMessage}>{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.error : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone *</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Address *</label>
              <input
                {...register('address')}
                className={`${styles.input} ${errors.address ? styles.error : ''}`}
                placeholder="Enter your street address"
              />
              {errors.address && (
                <span className={styles.errorMessage}>{errors.address.message}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>City *</label>
                <input
                  {...register('city')}
                  className={`${styles.input} ${errors.city ? styles.error : ''}`}
                  placeholder="Enter your city"
                />
                {errors.city && (
                  <span className={styles.errorMessage}>{errors.city.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>State *</label>
                <input
                  {...register('state')}
                  className={`${styles.input} ${errors.state ? styles.error : ''}`}
                  placeholder="Enter your state"
                />
                {errors.state && (
                  <span className={styles.errorMessage}>{errors.state.message}</span>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>ZIP Code *</label>
                <input
                  {...register('zipCode')}
                  className={`${styles.input} ${errors.zipCode ? styles.error : ''}`}
                  placeholder="Enter ZIP code"
                />
                {errors.zipCode && (
                  <span className={styles.errorMessage}>{errors.zipCode.message}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Country *</label>
              <select
                {...register('country')}
                className={`${styles.input} ${errors.country ? styles.error : ''}`}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
              </select>
              {errors.country && (
                <span className={styles.errorMessage}>{errors.country.message}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.continueButton}
              disabled={!isValid}
            >
              Continue to Payment
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <div className={styles.paymentSection}>
            <h3 className={styles.sectionTitle}>Payment Information</h3>
            <p>Payment integration will be implemented here.</p>
            <div className={styles.buttonGroup}>
              <button
                className={styles.backButton}
                onClick={() => setCurrentStep(1)}
              >
                Back to Shipping
              </button>
              <button
                className={styles.continueButton}
                onClick={() => setCurrentStep(3)}
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.reviewSection}>
            <h3 className={styles.sectionTitle}>Review Your Order</h3>
            <p>Order review and final confirmation will be implemented here.</p>
            <div className={styles.buttonGroup}>
              <button
                className={styles.backButton}
                onClick={() => setCurrentStep(2)}
              >
                Back to Payment
              </button>
              <button className={styles.placeOrderButton}>
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
