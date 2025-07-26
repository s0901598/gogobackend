import { NgModule } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzFormModule } from 'ng-zorro-antd/form';
import { BrowserModule } from '@angular/platform-browser';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { ReactiveFormsModule } from '@angular/forms';
import { zh_TW } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { UsermanageComponent } from './usermanage/usermanage.component';
import { NzListModule } from 'ng-zorro-antd/list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabelmanageComponent } from './labelmanage/labelmanage.component';
import { ProductlistComponent } from './productlist/productlist.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';




registerLocaleData(zh);


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    UsermanageComponent,
    LabelmanageComponent,
    ProductlistComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NzButtonModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzImageModule,
    NzModalModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSwitchModule,
    NzTableModule,
    NzDividerModule,
    NzUploadModule,
    NzTagModule,
    NzSelectModule,
    NzInputModule,
    NzListModule,
    BrowserAnimationsModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzAutocompleteModule



  ],
  providers: [
    provideNzI18n(zh_TW),
    provideAnimationsAsync(),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
