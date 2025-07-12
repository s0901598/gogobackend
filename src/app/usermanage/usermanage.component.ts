import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../services/user.service';
import { HttpService } from '../share/service/http.service';

@Component({
  selector: 'app-usermanage',
  standalone: false,
  templateUrl: './usermanage.component.html',
  styleUrl: './usermanage.component.css'
})
export class UsermanageComponent {

  searchdata=
    {
      username:"",
      phonenumber:"",
      isdelete:null as boolean | null
    }
  displayStatus = '全部'; // 用於顯示下拉選單的文字
  loading = false;
  users:any[] = []
  constructor(private http:HttpService){
    this.http.post('user/getusers/',this.searchdata).subscribe((x:any)=>{
      this.users = x.users;
    })
  }

  //列表是否封禁更改狀態
  changestus(user:any){
    user.isdelete = !user.isdelete;
    const data = {
      "memberid": user.memberid,
      "isdelete": user.isdelete
    }
    this.http.put('user/updateuserstatus/',data).subscribe((x:any)=>{

    })
    console.log(user)
}
  getuserfile(){
    this.http.post('user/getusers/',this.searchdata).subscribe((x:any)=>{
      this.users = x.users;
    })
  }
  reset(){
    this.searchdata = {
      username: '',
      phonenumber: '',
      isdelete: null
    };
    this.displayStatus = '全部';
    this.getuserfile()

  }
  // 選擇用戶狀態
  selectStatus(status: boolean|null) {
    this.searchdata.isdelete = status;
    this.displayStatus = status === null ? '全部' : status ? '封禁' : '未封禁';
  }
}

