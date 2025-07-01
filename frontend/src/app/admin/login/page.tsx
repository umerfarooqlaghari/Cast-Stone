'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Store admin token
        localStorage.setItem('adminToken', result.token);
        
        toast.success('Login successful!');
        
        // Check if password change is required
        if (result.admin.mustChangePassword) {
          router.push('/admin/change-password');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Shield className={styles.logoIcon} />
            <div>
              <h1 className={styles.logoTitle}>Cast Stone</h1>
              <p className={styles.logoSubtitle}>Admin Dashboard</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2 className={styles.title}>Admin Login</h2>
          <p className={styles.subtitle}>
            Sign in to access the admin dashboard
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Mail className={styles.labelIcon} />
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Lock className={styles.labelIcon} />
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${errors.password ? styles.error : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Authorized personnel only. All activities are logged and monitored.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
