import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { AiService, GeneratedContent } from '../../services/ai.service';
import { DataService, UserData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DashboardPage implements OnInit {
  business = '';
  offer = '';
  location = '';
  
  result: GeneratedContent | null = null;
  userData: UserData | null = null;
  uid: string | null = null;

  constructor(
    private aiService: AiService,
    private dataService: DataService,
    private authService: AuthService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
        this.dataService.getUserData(user.uid).subscribe(data => {
          this.userData = data;
        });
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  async generate() {
    if (!this.business || !this.offer || !this.location) {
      this.showToast('Please fill all fields');
      return;
    }

    if (this.userData && this.userData.credits <= 0) {
      this.showToast('Not enough credits. Please upgrade.');
      this.navCtrl.navigateForward('/upgrade');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Generating AI Content...',
    });
    await loading.present();

    try {
      this.result = await this.aiService.generateContent({
        business: this.business,
        offer: this.offer,
        location: this.location
      });
    } catch (e: any) {
      this.showToast(e.message || 'Error generating content');
    } finally {
      loading.dismiss();
    }
  }

  logout() {
    this.authService.logout();
  }

  goToUpgrade() {
    this.navCtrl.navigateForward('/upgrade');
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
