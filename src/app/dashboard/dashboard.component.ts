import { Component } from '@angular/core';
import { NzUploadFile } from 'ng-zorro-antd/upload';



@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
 
})
export class DashboardComponent {
  isCollapsed = false; // 控制側邊欄是否收起
  selectedNav: string = 'nav1'; // 默認選中 nav1
 
  // 點擊 nav 時切換選中的 nav
  selectNav(nav: string): void {
    this.selectedNav = nav;
  }


 
  

}
