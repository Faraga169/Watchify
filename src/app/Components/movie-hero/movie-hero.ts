import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../../Core/Interfaces/movie-model';

@Component({
  selector: 'app-movie-hero',
  imports: [],
  templateUrl: './movie-hero.html',
  styleUrl: './movie-hero.css',
})
export class MovieHero {
  @Input() movie!: Movie;
  @Output() watchRequested = new EventEmitter<void>();
  @Output() addToWatchLaterRequested = new EventEmitter<void>();
  onWatchClick() {
    this.watchRequested.emit();
  }
  onAddToWatchLater() {
    
    this.addToWatchLaterRequested.emit();
  }
}
