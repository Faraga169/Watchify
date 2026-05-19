import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NgStyle } from "@angular/common";
import { TmdbService } from '../../Core/Services/tmdb-service';
import { UserService } from '../../Core/Services/user-service';

@Component({
  selector: 'app-hero-banner',
  imports: [NgStyle],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner {

  private tmdbService = inject(TmdbService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  featured: any = null;
  genres: any;
  ngOnInit() {
    this.tmdbService.loadGenres().subscribe(
      () => {
        this.tmdbService.getAllTrending(2)
          .subscribe((res: any) => {
            this.featured = res[1];
            this.genres = this.tmdbService.getGenresByType(this.featured);
            this.cdr.detectChanges();
          });
      }

    );


  }
  goToDetails() {
    // Navigate to the details page based on media type and ID
    const id = this.featured.id;
    const route = this.featured.media_type === 'movie' ? `/Movies/${id}` : `/TvShows/${id}`;
    window.location.href = route; // Simple navigation, consider using Angular Router for better performance
  }
  addToWatchLater() {
    this.userService.addMedia('watchlist', this.featured, this.featured.media_type);
  }



}
