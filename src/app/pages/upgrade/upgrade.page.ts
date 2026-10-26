import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { DataService, UserData } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.page.html',
  styleUrls: ['./upgrade.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class UpgradePage implements OnInit {
  userData: UserData | null = null;
  uid: string | null = null;

  constructor(
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
      }
    });
    this.loadRazorpayScript();
  }

  loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }

  async upgradePlan() {
    if (!this.uid) return;

    const options = {
      key: 'rzp_test_YOUR_KEY_HERE', // Placeholder Key
      amount: 999 * 100, // ₹999 in paise
      currency: 'INR',
      name: 'AI Growth Engine',
      description: 'Pro Plan Upgrade',
      handler: async (response: any) => {
        // Successful payment
        const loading = await this.loadingCtrl.create({
          message: 'Upgrading your plan...',
        });
        await loading.present();

        try {
          if (this.uid) {
            await this.dataService.upgradeUserPlan(this.uid);
            this.showToast('Successfully upgraded to Pro!');
            this.navCtrl.navigateBack('/dashboard');
          }
        } catch (e) {
          this.showToast('Error upgrading plan');
        } finally {
          loading.dismiss();
        }
      },
      prefill: {
        email: this.userData?.email || ''
      },
      theme: {
        color: '#3880ff'
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      this.showToast('Razorpay failed to load.');
    }
  }

  goBack() {
    this.navCtrl.navigateBack('/dashboard');
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
