import { Component, inject, signal, output } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ApiService } from "../api.service";
import { AuthService } from "../auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registration.html',
  styleUrls: ['./registration.css']
})
export class RegistrationComponent {
  private formBuilder = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  registrationError = signal<string>('');
  isSubmitting = signal<boolean>(false);

  switchToLogin = output<void>();

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }

  equalPasswordsValidator(original: string, repeated: string) {
    return (control: AbstractControl) => {
      const pw1 = control.get(original)?.value;
      const pw2 = control.get(repeated)?.value;

      if (pw1 === pw2){
        return null;
      }

      return {passwordsNotEqual: true};
    }
  }

  registrationForm: FormGroup = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    passwords: this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]]
    }, {
      validators: [this.equalPasswordsValidator("password", "passwordConfirm")]
    })
  });

  onSubmitRegistration() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const formValue = this.registrationForm.value;

    // Check if passwords match
    if (formValue.password !== formValue.passwordConfirm) {
      this.registrationError.set('Die Passwörter stimmen nicht überein');
      return;
    }

    this.isSubmitting.set(true);
    this.registrationError.set('');

    // Remove passwordConfirm before sending to API
    // const { passwordConfirm, ...registrationData } = formValue;

    let regData = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.passwords.password,
      firstName: formValue.firstName,
      lastName: formValue.lastName
    }

    this.apiService.registerNewUser(regData).subscribe({
      next: () => {
        // After successful registration, automatically log in the user
        this.authService.login({ username: regData.username, password: regData.password }).subscribe({
          next: () => {
            // Login successful - user will be automatically shown the main app
            this.isSubmitting.set(false);
          },
          error: () => {
            // Registration successful but login failed - switch to login page
            this.isSubmitting.set(false);
            this.switchToLogin.emit();
          }
        });
      },
      error: (error) => {
        this.registrationError.set(error.message || 'Registrierung fehlgeschlagen');
        this.isSubmitting.set(false);
      }
    });
  }
}
