import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ChatBot } from "../chat-bot/chat-bot";
import { TmdbService } from '../../Core/Services/tmdb-service';
import { forkJoin } from 'rxjs';
import { SimilarMovie } from '../../Core/Interfaces/movie-model';
import { MovieSimilar } from '../movie-similar/movie-similar';
@Component({
  selector: 'app-recommendations',
  imports: [ChatBot , MovieSimilar],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.css',
})
export class Recommendations {
  moviesService = inject(TmdbService);
  changeRef = inject(ChangeDetectorRef);
  recommendedMovies = signal<SimilarMovie[]>([])
  handleMoviesRecommendation(ids : number[]) {
    forkJoin(
      ids.map(id => this.moviesService.getMedia(id.toString() , 'movie'))
    ).subscribe(results => {
      console.log(results);
      var movs = results.map((res):SimilarMovie => ({
        id : res.id ?? "",
        title : res.title ?? "",
        rating : res.vote_average ?? 0,
        year : new Date(res.release_date).getFullYear() ?? 1 ,
        posterUrl:res.poster_path ? `https://image.tmdb.org/t/p/w500${res.poster_path}` : '',
        genres: res.genres?.map((g: any) => g.name) || []
      }))
      this.recommendedMovies.set(movs)
      console.log(this.recommendedMovies());
    })
  }
}
