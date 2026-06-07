import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForumCategory, ForumPost, ForumReply, ForumGroup, ForumGroupMember } from '../models/forum-client.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForumClientService {
  private readonly base = `${environment.apiUrl}/forum`;

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<ForumCategory[]> {
    return this.http.get<ForumCategory[]>(`${this.base}/categories`);
  }

  getPosts(params?: { categoryId?: number; search?: string; groupId?: number }): Observable<ForumPost[]> {
    let httpParams = new HttpParams();
    if (params?.categoryId) httpParams = httpParams.set('categoryId', String(params.categoryId));
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.groupId) httpParams = httpParams.set('groupId', String(params.groupId));
    return this.http.get<ForumPost[]>(`${this.base}/posts`, { params: httpParams });
  }

  getPostById(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.base}/posts/${id}`);
  }

  createPost(payload: Partial<ForumPost>): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.base}/posts`, payload);
  }

  addReply(postId: number, payload: Partial<ForumReply>): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.base}/posts/${postId}/replies`, payload);
  }

  // --- Groups API ---
  createGroup(group: Partial<ForumGroup>): Observable<ForumGroup> {
    return this.http.post<ForumGroup>(`${this.base}/groups`, group);
  }

  getActiveGroups(): Observable<ForumGroup[]> {
    return this.http.get<ForumGroup[]>(`${this.base}/groups`);
  }

  getPendingGroups(): Observable<ForumGroup[]> {
    return this.http.get<ForumGroup[]>(`${this.base}/groups/pending`);
  }

  getMyGroups(email: string): Observable<ForumGroup[]> {
    return this.http.get<ForumGroup[]>(`${this.base}/groups/my-groups`, {
      params: new HttpParams().set('email', email)
    });
  }

  getGroupById(id: number): Observable<ForumGroup> {
    return this.http.get<ForumGroup>(`${this.base}/groups/${id}`);
  }

  approveGroup(id: number): Observable<ForumGroup> {
    return this.http.put<ForumGroup>(`${this.base}/groups/${id}/approve`, {});
  }

  rejectGroup(id: number): Observable<ForumGroup> {
    return this.http.put<ForumGroup>(`${this.base}/groups/${id}/reject`, {});
  }

  joinGroup(id: number, email: string, name: string): Observable<ForumGroupMember> {
    const params = new HttpParams()
      .set('email', email)
      .set('name', name);
    return this.http.post<ForumGroupMember>(`${this.base}/groups/${id}/join`, {}, { params });
  }

  getPendingMemberships(id: number, email: string): Observable<ForumGroupMember[]> {
    return this.http.get<ForumGroupMember[]>(`${this.base}/groups/${id}/pending-members`, {
      params: new HttpParams().set('email', email)
    });
  }

  approveMembership(id: number, memberId: number, email: string): Observable<ForumGroupMember> {
    return this.http.put<ForumGroupMember>(`${this.base}/groups/${id}/members/${memberId}/approve`, {}, {
      params: new HttpParams().set('email', email)
    });
  }

  rejectMembership(id: number, memberId: number, email: string): Observable<ForumGroupMember> {
    return this.http.put<ForumGroupMember>(`${this.base}/groups/${id}/members/${memberId}/reject`, {}, {
      params: new HttpParams().set('email', email)
    });
  }

  leaveGroup(id: number, email: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/groups/${id}/leave`, {
      params: new HttpParams().set('email', email)
    });
  }

  getGroupMembers(id: number): Observable<ForumGroupMember[]> {
    return this.http.get<ForumGroupMember[]>(`${this.base}/groups/${id}/members`);
  }

  getUserMemberships(email: string): Observable<ForumGroupMember[]> {
    return this.http.get<ForumGroupMember[]>(`${this.base}/groups/memberships`, {
      params: new HttpParams().set('email', email)
    });
  }
}

