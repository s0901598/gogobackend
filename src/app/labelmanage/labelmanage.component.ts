import { Component } from '@angular/core';
import { HttpService } from '../share/service/http.service';

@Component({
  selector: 'app-labelmanage',
  standalone: false,
  templateUrl: './labelmanage.component.html',
  styleUrl: './labelmanage.component.css'
})
export class LabelmanageComponent {
    labels:any[] = []
    
    showModal = false;
   
    constructor(private http:HttpService) {
       this.http.get('getlabel/').subscribe((x:any)=>{
      this.labels = x.labels;
    })
    }
    openModal(){
      this.showModal = true;
    }

  

}
