import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../Environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Recommendation {
  private COHERE_API_KEY = environment.apiKey;

  private COHERE_CHAT_URL = 'https://api.cohere.com/v2/chat';
  private COHERE_EMBED_URL = 'https://api.cohere.com/v2/embed';
  private COHERE_RERANK_URL = 'https://api.cohere.com/v2/rerank';

  private QDRANT_URL = 'http://localhost:6333/collections/movies/points/search';
  genreMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

  constructor(private http: HttpClient) {}

  // =========================
  // MAIN PIPELINE
  // =========================
  // role : user => content 
  // role : assistanct 
  async recommend(history: { role: string; content: string }[]) : Promise<any[]>{

    // 1. Rewrite history → clean query
    const rewritten = await this.rewriter(history);
    console.log(rewritten);

    // 2. Convert query → embeddings
    const embedding = await this.embed(rewritten);
    console.log(embedding);

    // 3. Search Qdrant
    const qdrantResults = await this.searchQdrant(embedding);
    console.log(qdrantResults);

    // 4. Rerank results
    const ranked = await this.rerank(rewritten, qdrantResults);
    console.log(ranked);

    return ranked.slice(0, 5);
  }

  // =========================
  // 1. REWRITER (Cohere Chat) // wich will take a histroy of message and generate => simple digist of it .
  // =========================
  private async rewriter(history: { role: string; content: string }[]) {

    const systemPrompt = `
You convert chat history into a compact semantic search query for movie retrieval.
Return ONLY a short query string.
`;

    const body = {
      model: 'command-r-plus-08-2024',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: JSON.stringify(history)
        }
      ]
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const res: any = await firstValueFrom(
      this.http.post(this.COHERE_CHAT_URL, body, { headers })
    );

    return res?.message?.content?.[0]?.text || '';
  }

  // =========================
  // 2. EMBEDDINGS
  // =========================
  private async embed(text: string) {

    const body = {
      model: "embed-v4.0",
      input_type: 'search_query',
      texts: [text]
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const res: any = await firstValueFrom(
      this.http.post(this.COHERE_EMBED_URL, body, { headers })
    );

    return res.embeddings.float[0];
  }

  // =========================
  // 3. QDRANT SEARCH
  // =========================
  private async searchQdrant(vector: number[]) {

    const body = {
      vector,
      limit: 10,
      with_payload: true
    };

    const res: any = await firstValueFrom(
      this.http.post(this.QDRANT_URL, body)
    );

    // Normalize documents for reranker
    return res.result.map((item: any) => ({
      id: item.id,
      text: `${item.payload.title} | ${(item.payload.genre_ids as number[]).map(id => this.genreMap[id]).join(',') } | ${item.payload.overview}`,
      payload: item.payload
    }));
  }

  // =========================
  // 4. RERANKER
  // =========================
  private async rerank(query: string, docs: any[]) {

    const body = {
      model: 'rerank-v3.5',
      query,
      documents: docs.map(d => d.text),
      top_n: 5
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.COHERE_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const res: any = await firstValueFrom(
      this.http.post(this.COHERE_RERANK_URL, body, { headers })
    );

    // Map back to original docs using index
    return res.results.map((r: any) => {
      const doc = docs[r.index];

      return {
        id: doc.id,
        score: r.relevance_score,
        title: doc.payload.title,
        genres: (doc.payload.genre_ids as number[]).map(id => this.genreMap[id]).join(','),
        overview: doc.payload.overview
      };
    });
  }
}
