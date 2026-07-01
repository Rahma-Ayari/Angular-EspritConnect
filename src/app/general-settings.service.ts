import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface GeneralSettings {
  alumniDebytmentEmail: string;
  alumniDebytmentPhone: string;
  donationOptInPageEnabled: boolean;
  invitationsEventsStudent: boolean;
  invitationsEventsAlumni: boolean;
  invitationsEventsCompany: boolean;
  invitationsEventsTeacherStaff: boolean;
  universityUpdatesStudent: boolean;
  universityUpdatesAlumni: boolean;
  universityUpdatesCompany: boolean;
  universityUpdatesTeacherStaff: boolean;
  fundraisingEmailsStudent: boolean;
  fundraisingEmailsAlumni: boolean;
  fundraisingEmailsCompany: boolean;
  fundraisingEmailsTeacherStaff: boolean;
}

@Injectable({ providedIn: 'root' })
export class GeneralSettingsService {
  private readonly API = `${environment.apiUrl}/admin/settings/general`;

  constructor(private http: HttpClient) {}

  get(): Observable<GeneralSettings> {
    return this.http.get<GeneralSettings>(this.API);
  }

  update(body: GeneralSettings): Observable<GeneralSettings> {
    return this.http.put<GeneralSettings>(this.API, body);
  }
}
