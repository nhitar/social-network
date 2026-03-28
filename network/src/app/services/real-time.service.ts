import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  
  private eventSource!: EventSource;

  connect(): Observable<any> {
    return new Observable(observer => {
      this.eventSource = new EventSource('http://localhost:3000/api/events');
      
      this.eventSource.onopen = () => {
        console.log('Соединение открыто');
      };
      
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);
        } catch (error) {
          console.error('Ошибка обработки SSE:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        observer.error('Ошибка SSE: ' + error);
      };
      
      return () => {
        if (this.eventSource) {
          this.eventSource.close();
        }
      };
    });
  }
}