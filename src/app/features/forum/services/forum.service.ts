import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumCategory, ForumPost, ForumReply, ForumStats } from '../models/forum.models';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private base = 'http://localhost:8088/espritconnect/api/forum';

  constructor(private http: HttpClient) {}

  // ==========================================
  //            CATEGORIES OPERATIONS
  // ==========================================

  getCategories(): Observable<ForumCategory[]> {
    return this.http.get<ForumCategory[]>(`${this.base}/categories`);
  }

  getCategoryById(id: number): Observable<ForumCategory> {
    return this.http.get<ForumCategory>(`${this.base}/categories/${id}`);
  }

  createCategory(category: ForumCategory): Observable<ForumCategory> {
    return this.http.post<ForumCategory>(`${this.base}/categories`, category);
  }

  updateCategory(id: number, category: ForumCategory): Observable<ForumCategory> {
    return this.http.put<ForumCategory>(`${this.base}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/categories/${id}`);
  }

  getPostCountsPerCategory(): Observable<Record<number, number>> {
    return this.http.get<Record<number, number>>(`${this.base}/categories/post-counts`);
  }

  // ==========================================
  //               POSTS OPERATIONS
  // ==========================================

  getPosts(filters: { categoryId?: number; authorRole?: string; reported?: boolean; search?: string } = {}): Observable<ForumPost[]> {
    let params = new HttpParams();
    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }
    if (filters.authorRole) {
      params = params.set('authorRole', filters.authorRole);
    }
    if (filters.reported !== undefined) {
      params = params.set('reported', filters.reported.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    return this.http.get<ForumPost[]>(`${this.base}/posts`, { params });
  }

  getPostById(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.base}/posts/${id}`);
  }

  createPost(post: ForumPost): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.base}/posts`, post);
  }

  updatePost(id: number, post: ForumPost): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}`, post);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/posts/${id}`);
  }

  togglePinPost(id: number): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}/pin`, {});
  }

  reportPost(id: number, reason: string): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}/report`, { reason });
  }

  resolvePostReport(id: number): Observable<ForumPost> {
    return this.http.put<ForumPost>(`${this.base}/posts/${id}/resolve-report`, {});
  }

  // ==========================================
  //              REPLIES OPERATIONS
  // ==========================================

  addReply(postId: number, reply: ForumReply): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.base}/posts/${postId}/replies`, reply);
  }

  deleteReply(replyId: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/replies/${replyId}`);
  }

  reportReply(replyId: number, reason: string): Observable<ForumReply> {
    return this.http.put<ForumReply>(`${this.base}/replies/${replyId}/report`, { reason });
  }

  resolveReplyReport(replyId: number): Observable<ForumReply> {
    return this.http.put<ForumReply>(`${this.base}/replies/${replyId}/resolve-report`, {});
  }

  // ==========================================
  //           STATS & MODERATION
  // ==========================================

  getReportedPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(`${this.base}/reported-posts`);
  }

  getReportedReplies(): Observable<ForumReply[]> {
    return this.http.get<ForumReply[]>(`${this.base}/reported-replies`);
  }

  getStats(): Observable<ForumStats> {
    return this.http.get<ForumStats>(`${this.base}/stats`);
  }
}
