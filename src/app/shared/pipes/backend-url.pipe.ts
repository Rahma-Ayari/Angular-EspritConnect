import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'backendUrl', standalone: true })
export class BackendUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    if (value.startsWith('http')) return value;
    if (!value.startsWith('/')) {
      value = '/' + value;
    }
    return environment.backendOrigin + environment.contextPath + value;
  }
}
