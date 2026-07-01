import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-skill-tags-input',
  templateUrl: './skill-tags-input.component.html',
  styleUrls: ['./skill-tags-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillTagsInputComponent),
      multi: true
    }
  ]
})
export class SkillTagsInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Ajouter une compétence...';
  @Input() maxTags = 20;
  @Input() suggestions: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();

  tags: string[] = [];
  inputValue = '';
  showSuggestions = false;
  filteredSuggestions: string[] = [];

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor implementation
  writeValue(value: string[]): void {
    this.tags = value || [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Input handling
  onInputChange(): void {
    if (this.inputValue && this.suggestions.length > 0) {
      this.filteredSuggestions = this.suggestions
        .filter(s => 
          s.toLowerCase().includes(this.inputValue.toLowerCase()) &&
          !this.tags.includes(s)
        )
        .slice(0, 5);
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTag();
    } else if (event.key === 'Backspace' && !this.inputValue && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  addTag(tag?: string): void {
    const value = (tag || this.inputValue).trim();
    
    if (!value) return;
    if (this.tags.length >= this.maxTags) return;
    if (this.tags.includes(value)) return;

    this.tags.push(value);
    this.inputValue = '';
    this.showSuggestions = false;
    this.emitChange();
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
    this.emitChange();
  }

  selectSuggestion(suggestion: string): void {
    this.addTag(suggestion);
  }

  private emitChange(): void {
    this.onChange(this.tags);
    this.tagsChange.emit(this.tags);
    this.onTouched();
  }

  onBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      if (this.inputValue.trim()) {
        this.addTag();
      }
    }, 200);
  }
}
