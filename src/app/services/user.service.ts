import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface User{
  username: string
  account: string
  password:string
  gender:boolean
  bir: string  // 假設為日期格式，如 "YYYY-MM-DD"
  phonenumber: string
  createtime:Date
  isdelete:boolean
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
}
