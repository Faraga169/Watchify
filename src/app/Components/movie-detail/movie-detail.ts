import { Component, inject } from '@angular/core';
import { MovieHero } from "../movie-hero/movie-hero";
import { MovieInfo } from "../movie-info/movie-info";
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from '../../Core/Interfaces/movie-model';
import { MovieReviews } from "../movie-reviews/movie-reviews";
import { MovieTrailer } from "../movie-trailer/movie-trailer";
import { MovieSimilar } from "../movie-similar/movie-similar";
import { VideoPlayer } from "../video-player/video-player";
import { TmdbService } from '../../Core/Services/tmdb-service';
import { Authentication } from '../../Core/Services/authentication';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../Core/Services/user-service';

@Component({
  selector: 'app-movie-detail',
  imports: [MovieHero, MovieInfo, MovieReviews, MovieTrailer, MovieSimilar, VideoPlayer],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css',
})
export class MovieDetail {
  showPlayer = false;
  isUserSubscribed = false;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(TmdbService);
  private cdr = inject(ChangeDetectorRef);
  userService = inject(UserService);

  selectedSeasonIndex = 0;
  selectedEpisodeIndex = 0;
  currentMovie: Movie | null = null;
  constructor(private authService: Authentication) {
    // Check subscription status from your service
    var userId = localStorage.getItem('Id');
    if (userId) {
      this.authService.getUserById(userId).subscribe({
        next: (user) => {
          this.isUserSubscribed = (user.IsSubscribe ?? false) && (user.SubscriptionEndDate != null && new Date(user.SubscriptionEndDate) > new Date());
        },
        error: () => {
          this.isUserSubscribed = false;
        },
      });
    }
  }
  ngOnInit() {
    // Use the observable paramMap to handle navigation to similar movies
    console.log("MovieDetail INIT");
    this.route.paramMap.subscribe(params => {
      console.log("PARAMMAP TRIGGERED");
      const id = params.get('id');
      console.log("ID:", id);
      this.fetchMovieDetails(params.get('id'));
    });
  }
  get selectedSeason() {
    return this.currentMovie?.seasons?.[this.selectedSeasonIndex];
  }

  get selectedEpisode() {
    return this.selectedSeason?.episodes?.[this.selectedEpisodeIndex];
  }
  fetchMovieDetails(id: string | null) {
    console.log("FETCH CALLED", id);
    const mediaId = id || '1';
    // 1. Get the mediaType from route data ('movie' or 'tv')
    const type = this.route.snapshot.data['mediaType'] as 'movie' | 'tv';
    console.log("TYPE:", type);
    // 2. Set Static Data immediately for testing/instant loading
    this.currentMovie = {
      id: mediaId,
      title: type === 'movie' ? 'The Nebula Protocol' : 'Nebula: The Series',
      rating: 8.9,
      description: 'In a future where memories can be harvested...',
      backdropUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
      director: 'Denis Villeneuve',
      studio: 'Orion Pictures',
      genres: ['Sci-Fi', 'Thriller'],
      year: 2024,
      duration: '2h 15m',
      budget: '$150 million',
      writer: 'Denis Villeneuve',
      cast: [
        { name: 'Elena Vance', role: 'Commander', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
        { name: 'Marcus Thorne', role: 'Specialist', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' }
      ],
      trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      reviews: [],
      similarMovies: [],
      streamUrl: 'https://www.youtube.com/embed/Aq5WXmQQooo',
      isSeries: type === 'tv',
      currentEpisodeIndex: type === 'tv' ? 0 : undefined,
      seasons: type === 'tv' ? [
        {
          seasonNumber: 1,
          episode_count: 2,
          episodes: [
            { id: 's1e1', title: 'Episode 1: Awakening', streamUrl: 'https://www.youtube.com/embed/Aq5WXmQQooo', order: 1 },
            { id: 's1e2', title: 'Episode 2: Descent', streamUrl: 'https://www.youtube.com/embed/Aq5WXmQQooo', order: 2 }
          ]
        },
        {
          seasonNumber: 2,
          episode_count: 2,

          episodes: [
            { id: 's2e1', title: 'Episode 1: Resurgence', streamUrl: 'https://www.youtube.com/embed/Aq5WXmQQooo', order: 1 },
            { id: 's2e2', title: 'Episode 2: Eclipse', streamUrl: 'https://www.youtube.com/embed/Aq5WXmQQooo', order: 2 }
          ]
        }
      ] : undefined
    };

    // 3. Call the TMDB Service (Overwrites static data when API responds)
    this.movieService.getMediaDetails(mediaId, type).subscribe({
      next: (data) => {
        console.log("API SUCCESS:", data);
        // Preserve your streamUrl/episodes if TMDB doesn't provide them
        this.currentMovie = {
          ...data,
          streamUrl: this.currentMovie?.streamUrl || '',
        };
        this.cdr.markForCheck(); // Ensure view updates with new data
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.warn('API Error, keeping static test data:', err);
        if (err.status === 404) {
          const fallbackType = type === 'movie' ? 'tv' : 'movie';

          this.movieService.getMediaDetails(mediaId, fallbackType).subscribe({
            next: (data) => {
              console.log("FALLBACK SUCCESS:", data);

              this.currentMovie = {
                ...data,
                streamUrl: this.currentMovie?.streamUrl || '',
              };

              this.cdr.markForCheck();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },

            error: (fallbackErr) => {
              console.error('Fallback also failed:', fallbackErr);
            }
          });

          return;
        }
      }
    });
  }

  changeEpisode(direction: number) {
    const season = this.selectedSeason;
    if (!season?.episodes?.length) return;

    const newIndex = this.selectedEpisodeIndex + direction;

    if (newIndex >= 0 && newIndex < season.episodes.length) {
      this.selectedEpisodeIndex = newIndex;
      this.currentMovie!.streamUrl = season.episodes[newIndex].streamUrl;
    }
  }
  changeSeason(index: number) {
    this.selectedSeasonIndex = index;
    this.selectedEpisodeIndex = 0;

    const season = this.selectedSeason;

    if (season?.episodes?.length) return;

    this.movieService
      .getMediaSeasonDetails(
        this.currentMovie!.id,
        season!.seasonNumber
      )
      .subscribe(res => {

        season!.episodes =
          res.episodes.map((e: any) => ({
            id: e.id.toString(),
            title: e.name,
            order: e.episode_number,
            streamUrl: this.currentMovie!.streamUrl
          }));

        this.cdr.markForCheck();
      });
  }

  handleWatchNow() {
    if (this.isUserSubscribed) {
      this.showPlayer = true;
      // Smooth scroll to the player
      setTimeout(() => {
        document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
        const type = this.route.snapshot.data['mediaType'] as 'movie' | 'tv';
        const media = this.MapToTmdbMovie(this.currentMovie!, type);
        console.log("Adding to Watch History:", media);
        this.userService.addMedia('history', media, type);

      }, 100);

    } else {
      // If not subscribed, redirect to pricing or show a modal
      //alert('Subscription Required! Redirecting to plans...');
      this.router.navigate(['/subscription']);
    }
  }
  handleAddToWatchLater() {
    if (!this.currentMovie) {
      return;
    }
    const type = this.route.snapshot.data['mediaType'] as 'movie' | 'tv';
    const media = this.MapToTmdbMovie(this.currentMovie, type);
    console.log("Adding to Watch Later:", media);
    this.userService.addMedia('watchlist', media, type);
  }

  MapToTmdbMovie(movie: Movie, type: 'movie' | 'tv') {
    return{
          "id": movie.id,
          "type": type,
          "watchedAt": new Date().toISOString(),
         
          "adult": false,
          "backdrop_path": "/" + new URL(movie.backdropUrl).pathname.split('/').pop(),
          "title": movie.title,
          "original_title": movie.title,
          "overview": movie.description,
          "poster_path": "/" + new URL(movie.posterUrl).pathname.split('/').pop(),
          "media_type": "movie",
          "original_language": "en",
          "genre_ids": [
            35,
            27
          ],
          "popularity": movie.rating,
          "release_date": movie.year.toString(),
          "softcore": false,
          "video": false,
          "vote_average": movie.rating,
          "vote_count": 0
          }
        
  }
 
}
