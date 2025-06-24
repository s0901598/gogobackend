import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { presetColors } from 'ng-zorro-antd/core/color';
import { NzUploadChangeParam, NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { da_DK } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Router } from '@angular/router';
import { HttpService } from '../share/service/http.service';



@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',

})
export class DashboardComponent {
  selectedLabels: string[] = []; // 當前選中的標籤
  selectedNav: string = 'nav1'; // 默認選中 nav1
  constructor(private http:HttpService,  private modal: NzModalService,private fb:FormBuilder,private message:NzMessageService,private router: Router) {
  }

   // 點擊 nav 時切換選中的 nav
   selectNav(nav: string): void {
    this.selectedNav = nav;
  }
  // 新增登出方法
  logout(): void {
    this.message.success('已登出');
    this.router.navigate(['/login']); // 跳轉到登入頁面
  }


}
