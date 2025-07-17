import { Pipe, PipeTransform } from '@angular/core';
import { Codelist } from '../models/codelist';

@Pipe({
  name: 'codelistPipe'
})
export class CodelistPipe implements PipeTransform {

  transform(id: number | null | undefined, list: Codelist[]): string {
    const match = list.find(item => item.id === id); // `+id` to handle string/number
    return match ? match.name : '';
  }

}
