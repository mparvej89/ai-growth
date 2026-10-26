import { Injectable } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { environment } from '../../environments/environment';

export interface GenerateContentRequest {
  business: string;
  offer: string;
  location: string;
}

export interface GeneratedContent {
  instagram: string;
  whatsapp: string;
  cta: string;
  poster: string;
  posterImage?: string;
  hashtags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private functions: Functions;

  constructor() {
    const app = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.functions = getFunctions(app);
  }

  async generateContent(data: GenerateContentRequest): Promise<GeneratedContent> {
    const generateFn = httpsCallable(this.functions, 'generateContent');
    const result = await generateFn(data);
    return result.data as GeneratedContent;
  }
}
