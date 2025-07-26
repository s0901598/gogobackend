import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http:HttpClient) { }

  // GET 請求
  origin_get<T>(endpoint: string, params?: { [key: string]: any }): Observable<T> {
    const httpOptions = this.buildHttpOptions(params);
    return this.http.get<T>(`${endpoint}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }


  // GET 請求
  get<T>(endpoint: string, params?: { [key: string]: any }): Observable<T> {
    const httpOptions = this.buildHttpOptions(params);
    return this.http.get<T>(`${environment.apiUrl}/${endpoint}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // POST 請求
  post<T>(endpoint: string, data: any, params?: { [key: string]: any }): Observable<T> {
    const httpOptions = this.buildHttpOptions(params);
    return this.http.post<T>(`${environment.apiUrl}/${endpoint}`, data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // PUT 請求
  put<T>(endpoint: string, data: any, params?: { [key: string]: any }): Observable<T> {
    const httpOptions = this.buildHttpOptions(params);
    return this.http.put<T>(`${environment.apiUrl}/${endpoint}`, data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE 請求
  delete<T>(endpoint: string, params?: { [key: string]: any }): Observable<T> {
    const httpOptions = this.buildHttpOptions(params);
    return this.http.delete<T>(`${environment.apiUrl}/${endpoint}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // 建立 HTTP 選項（包含 headers 和查詢參數）
  private buildHttpOptions(params?: { [key: string]: any }) {
    let httpOptions: { headers: HttpHeaders; params?: HttpParams } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 如需要可加入其他預設 headers，例如：
        // 'Authorization': `Bearer ${yourToken}`
      })
    };

    if (params) {
      let httpParams = new HttpParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
      httpOptions.params = httpParams;
    }

    return httpOptions;
  }

  // 錯誤處理
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '發生錯誤';

    if (error.error instanceof ErrorEvent) {
      // 客戶端錯誤
      errorMessage = `客戶端錯誤：${error.error.message}`;
    } else {
      // 伺服器端錯誤
      errorMessage = `伺服器錯誤：${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
