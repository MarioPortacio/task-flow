import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; 
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HelpStateService {
  private readonly STORAGE_KEY = 'taskflow_help_dismissed';
  private isBrowser: boolean;

  
  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  isHelpVisible(): boolean {
   
    if (this.isBrowser) {
      const status = localStorage.getItem(this.STORAGE_KEY);
      return status !== 'true';
    }
    
    return false;
  }

  dismissHelp(): void {
    
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, 'true');
    }
  }

  resetHelp(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}