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

  users:any[] = []
  constructor(private http:HttpService){
    this.http.get('getusers/').subscribe((x:any)=>{
      this.users = x.users;
    })
  }
}
