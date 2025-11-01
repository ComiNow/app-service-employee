import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _registerData = new BehaviorSubject<any | null>(null);
  registerData$: Observable<any | null> = this._registerData.asObservable();

  constructor() { }

  setRegisterData(data: any) {
    this._registerData.next(data);
  }

  getRegisterData(): any | null {
    return this._registerData.getValue();
  }

  clearRegisterData() {
    this._registerData.next(null);
  }
}