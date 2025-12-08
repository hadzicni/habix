import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private networkStatusSubject = new BehaviorSubject<boolean>(true);
  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener() {
    // Get initial network status
    const status = await Network.getStatus();
    this.networkStatusSubject.next(status.connected);

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      this.networkStatusSubject.next(status.connected);
    });
  }

  async isOnline(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  async getNetworkStatus() {
    return await Network.getStatus();
  }

  getCurrentStatus(): boolean {
    return this.networkStatusSubject.value;
  }
}
