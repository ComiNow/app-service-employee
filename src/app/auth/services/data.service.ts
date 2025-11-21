import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEY = 'register_step_1_data';
  private _registerData = new BehaviorSubject<any | null>(this.loadFromStorage());
  registerData$: Observable<any | null> = this._registerData.asObservable();

  setRegisterData(data: any) {
    this._registerData.next(data);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  getRegisterData(): any | null {
    const data = this._registerData.getValue();
    if (data) return data;
    return this.loadFromStorage();
  }

  clearRegisterData() {
    this._registerData.next(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): any | null {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}