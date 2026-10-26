import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  isLogin = true;

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async submit() {
    try {
      if (this.isLogin) {
        await this.authService.login({ email: this.email, password: this.password });
      } else {
        await this.authService.register({ email: this.email, password: this.password });
      }
      this.navCtrl.navigateRoot('/dashboard');
    } catch (e: any) {
      const toast = await this.toastCtrl.create({
        message: e.message,
        duration: 3000,
        color: 'danger'
      });
      toast.present();
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
  }
}
