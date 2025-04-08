import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router'; // 用於跳轉

interface User{
  username:string;
  password:string;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false; // 控制按鈕載入狀態

  // 定義帳號密碼列表
  private users: User[] = [
    { username: 'admin01', password: '111111' },
    { username: 'admin02', password: '111111' },
    { username: 'admin03', password: '111111' },
    { username: 'admin04', password: '111111' },
    { username: 'admin05', password: '111111' },
  ];

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
}

ngOnInit(): void {}
// 提交表單
submitForm(): void {
  if (this.loginForm.valid) {
    this.isLoading = true;
    const { username, password } = this.loginForm.value;
    // 檢查是否匹配列表中的帳號密碼
    const user = this.users.find(
      u => u.username === username && u.password === password
    );
// 模擬登入邏輯（這裡可以用後端 API 替換）
setTimeout(() => {
  if (username === user?.username && password ===user?.password) {
    this.message.success('登入成功！');
    // 假設登入成功後跳轉到 dashboard
    this.router.navigate(['/dashboard']);
  } else {
    this.message.error('用戶名或密碼錯誤！');
  }
  this.isLoading = false;
}, 900); // 模擬 1 秒延遲
} else {
Object.values(this.loginForm.controls).forEach(control => {
  control.markAsDirty();
  control.updateValueAndValidity();
});
}
}


}



