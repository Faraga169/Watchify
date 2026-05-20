import { Routes, CanActivateFn } from '@angular/router';
import { Auth } from './Layouts/auth/auth';
import { SignUp } from './Components/sign-up/sign-up';
import { SignIn } from './Components/sign-in/sign-in';
import { Blank } from './Layouts/blank/blank';
import { Home } from './Components/home/home';
import { NotFound } from './Components/not-found/not-found';
import { authneticatedGuard } from './Core/guards/authneticated-guard';
import { ForgetPassword } from './Components/forget-password/forget-password';
import { MoviesGallery } from './Components/movies-gallery/movies-gallery';
import { TvGallery } from './Components/tv-gallery/tv-gallery';
import { MovieDetail } from './Components/movie-detail/movie-detail';
import { WatchLater } from './Components/watch-later/watch-later';
import { MyList } from './Components/my-list/my-list';
import { Recommendations } from './Components/recommendations/recommendations';

export const routes: Routes = [
  // Auth routes
  {
    path: '',
    component: Auth,
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
      },
      {
        path: 'sign-up',
        component: SignUp,
      },
      {
        path: 'sign-in',
        component: SignIn,
      },
      {
        path: 'forgetpassword',
        component: ForgetPassword,
      },
    ],
  },

  // Blank route
  {
    path: '',
    component: Blank,
    canActivate: [authneticatedGuard],
    children: [
      {
        path: '',
        redirectTo: 'Home',
        pathMatch: 'full',
      },
      {
        path: 'Home',
        component: Home,
      },
      { path: 'Movies/:id', component: MovieDetail, data: { mediaType: 'movie' } },
      { path: 'TvShows/:id', component: MovieDetail, data: { mediaType: 'tv' } },
      {
        path: 'Movies',
        component: MoviesGallery,
      },

      {
        path: 'TvShows',
        component: TvGallery,
      },
      {
        path: 'MyList',
        component: MyList,
      },
      {
        path: 'Recommendations',
        component: Recommendations
      },
      {
        title: 'Subscription',
        path: 'subscription',
        loadComponent: () =>
          import('./Components/subscription/subscription').then((m) => m.SubscriptionComponent),
      },
      {
        title: 'Profile',
        path: 'profile',
        loadComponent: () =>
          import('./Components/profile/profile').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    title: 'Success',
    path: 'success',
    canActivate: [authneticatedGuard],
    loadComponent: () => import('./Components/success/success').then((m) => m.SuccessComponent),
  },
  // Wildcard route for 404 page
  {
    path: '**',
    component: NotFound,
  },
];
